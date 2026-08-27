import { AgentRole, BudgetConfig, ProviderType, SimulationConfig, UserProviderKeyConfig } from '../../shared/types.ts';
import { AIProvider, AIProviderModel, ProviderGenerateResult, ProviderValidationResult } from './types.ts';
import { geminiProvider } from './geminiProvider.ts';
import { openAIProvider } from './openaiProvider.ts';
import { anthropicProvider } from './anthropicProvider.ts';

export interface UnifiedCallParams {
  role: AgentRole;
  prompt: string;
  systemInstruction?: string;
  provider?: ProviderType;
  model?: string;
  userKeys?: Partial<Record<ProviderType, string>>;
  budgetConfig?: BudgetConfig;
  temperature?: number;
  useHighThinking?: boolean;
  onLog?: (msg: string, type: 'info' | 'warn' | 'success') => void;
}

export interface UnifiedCallResult<T> {
  data: T;
  rawText: string;
  provider: ProviderType;
  model: string;
  latencyMs: number;
  fallbackUsed: boolean;
  tokensEstimated: number;
  slotName: string;
}

export class AIProviderManager {
  private providers: Map<ProviderType, AIProvider> = new Map();
  private mockMode: boolean = false;
  private totalRequests: number = 0;
  private tokensEstimated: number = 0;
  private agentLatencies: Record<string, number> = {};
  private activeCallCount: number = 0;

  constructor() {
    this.providers.set('gemini', geminiProvider);
    this.providers.set('openai', openAIProvider);
    this.providers.set('anthropic', anthropicProvider);

    // Initial check for server env keys
    const hasAnyServerKey = !!(
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.OPENAI_API_KEY ||
      process.env.ANTHROPIC_API_KEY
    );

    this.mockMode = process.env.MOCK_MODE === 'true' || !hasAnyServerKey;
  }

  public isMockMode(): boolean {
    return this.mockMode;
  }

  public setMockMode(val: boolean) {
    this.mockMode = val;
  }

  public getProvider(id: ProviderType): AIProvider | undefined {
    return this.providers.get(id);
  }

  public listAllModels(): Record<ProviderType, { name: string; defaultModel: string; models: AIProviderModel[] }> {
    const result: any = {};
    for (const [id, provider] of this.providers.entries()) {
      result[id] = {
        name: provider.name,
        defaultModel: provider.defaultModel,
        models: provider.listModels()
      };
    }
    return result;
  }

  public async validateKey(providerId: ProviderType, apiKey: string, model?: string): Promise<ProviderValidationResult> {
    const provider = this.providers.get(providerId);
    if (!provider) {
      return {
        valid: false,
        provider: providerId,
        model: model || 'default',
        error: `Unknown provider: ${providerId}`
      };
    }
    return await provider.validateKey(apiKey, model);
  }

  private resolveApiKey(providerId: ProviderType, userKeys?: Partial<Record<ProviderType, string>>): string | undefined {
    // 1. User supplied BYOK key always takes highest priority
    if (userKeys && userKeys[providerId] && userKeys[providerId]!.trim().length > 0) {
      return userKeys[providerId]!.trim();
    }

    // 2. Server environment variable fallback (for optional demo / admin instances)
    if (providerId === 'gemini') {
      return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    }
    if (providerId === 'openai') {
      return process.env.OPENAI_API_KEY;
    }
    if (providerId === 'anthropic') {
      return process.env.ANTHROPIC_API_KEY;
    }
    return undefined;
  }

  public async generateJSON<T>(params: UnifiedCallParams): Promise<UnifiedCallResult<T>> {
    const requestedProvider = params.provider || 'gemini';
    const primaryProvider = this.providers.get(requestedProvider) || geminiProvider;
    const targetModel = params.model || primaryProvider.defaultModel;

    // Check Budget Limit
    if (params.budgetConfig?.enableCostProtection && params.budgetConfig.maxApiCalls > 0) {
      if (this.activeCallCount >= params.budgetConfig.maxApiCalls) {
        params.onLog?.(`Budget limit reached (${params.budgetConfig.maxApiCalls} calls). Engaging deterministic simulation engine...`, 'warn');
        throw new Error('MOCK_FALLBACK_TRIGGER');
      }
    }

    // Check if Mock Mode or no keys anywhere
    const primaryKey = this.resolveApiKey(requestedProvider, params.userKeys);
    if (this.mockMode && !primaryKey) {
      throw new Error('MOCK_FALLBACK_TRIGGER');
    }

    if (!primaryKey) {
      // Check fallback provider before giving up to mock
      if (params.budgetConfig?.fallbackProvider && params.budgetConfig.fallbackProvider !== 'none' && params.budgetConfig.fallbackProvider !== requestedProvider) {
        const fallbackId = params.budgetConfig.fallbackProvider;
        const fallbackKey = this.resolveApiKey(fallbackId, params.userKeys);
        if (fallbackKey) {
          const fallbackProvider = this.providers.get(fallbackId);
          if (fallbackProvider) {
            params.onLog?.(`No key for ${primaryProvider.name}, attempting fallback provider: ${fallbackProvider.name}...`, 'info');
            return await this.executeProviderJSON<T>(fallbackProvider, {
              ...params,
              provider: fallbackId,
              model: fallbackProvider.defaultModel
            }, fallbackKey, true);
          }
        }
      }
      throw new Error('MOCK_FALLBACK_TRIGGER');
    }

    // Attempt Primary Provider
    try {
      this.activeCallCount++;
      return await this.executeProviderJSON<T>(primaryProvider, params, primaryKey, false);
    } catch (primaryErr: any) {
      const errMessage = primaryErr?.message || String(primaryErr);
      params.onLog?.(`${primaryProvider.name} request failed: ${errMessage.slice(0, 100)}`, 'warn');

      // Attempt Fallback Provider if configured
      if (params.budgetConfig?.fallbackProvider && params.budgetConfig.fallbackProvider !== 'none' && params.budgetConfig.fallbackProvider !== requestedProvider) {
        const fallbackId = params.budgetConfig.fallbackProvider;
        const fallbackKey = this.resolveApiKey(fallbackId, params.userKeys);
        if (fallbackKey) {
          const fallbackProvider = this.providers.get(fallbackId);
          if (fallbackProvider) {
            params.onLog?.(`Engaging fallback provider: ${fallbackProvider.name}...`, 'info');
            try {
              return await this.executeProviderJSON<T>(fallbackProvider, {
                ...params,
                provider: fallbackId,
                model: fallbackProvider.defaultModel
              }, fallbackKey, true);
            } catch (fallbackErr: any) {
              params.onLog?.(`Fallback provider ${fallbackProvider.name} also failed. Reverting to deterministic engine.`, 'warn');
            }
          }
        }
      }

      throw new Error('MOCK_FALLBACK_TRIGGER');
    }
  }

  private async executeProviderJSON<T>(
    provider: AIProvider,
    params: UnifiedCallParams,
    apiKey: string,
    isFallback: boolean
  ): Promise<UnifiedCallResult<T>> {
    const targetModel = params.model || provider.defaultModel;
    const startTime = Date.now();

    const result = await provider.generateJSON<T>({
      prompt: params.prompt,
      systemInstruction: params.systemInstruction,
      model: targetModel,
      apiKey,
      temperature: params.temperature,
      useHighThinking: params.useHighThinking
    });

    this.totalRequests++;
    const latency = Date.now() - startTime;
    this.agentLatencies[params.role] = latency;
    const tokens = result.usage?.totalTokens || Math.ceil((params.prompt.length + result.rawText.length) / 4);
    this.tokensEstimated += tokens;

    return {
      data: result.data,
      rawText: result.rawText,
      provider: provider.id,
      model: targetModel,
      latencyMs: latency,
      fallbackUsed: isFallback,
      tokensEstimated: tokens,
      slotName: `${provider.name} (${targetModel})${isFallback ? ' [Fallback]' : ''}`
    };
  }

  public async generateText(params: UnifiedCallParams): Promise<UnifiedCallResult<string>> {
    const requestedProvider = params.provider || 'gemini';
    const primaryProvider = this.providers.get(requestedProvider) || geminiProvider;
    const targetModel = params.model || primaryProvider.defaultModel;

    const primaryKey = this.resolveApiKey(requestedProvider, params.userKeys);
    if (this.mockMode && !primaryKey) {
      throw new Error('MOCK_FALLBACK_TRIGGER');
    }

    if (!primaryKey) {
      throw new Error('MOCK_FALLBACK_TRIGGER');
    }

    try {
      this.activeCallCount++;
      const result = await primaryProvider.generateText({
        prompt: params.prompt,
        systemInstruction: params.systemInstruction,
        model: targetModel,
        apiKey: primaryKey,
        temperature: params.temperature
      });

      this.totalRequests++;
      const latency = result.latencyMs;
      this.agentLatencies[params.role] = latency;
      const tokens = result.usage?.totalTokens || Math.ceil((params.prompt.length + result.rawText.length) / 4);
      this.tokensEstimated += tokens;

      return {
        data: result.data,
        rawText: result.rawText,
        provider: primaryProvider.id,
        model: targetModel,
        latencyMs: latency,
        fallbackUsed: false,
        tokensEstimated: tokens,
        slotName: `${primaryProvider.name} (${targetModel})`
      };
    } catch (err: any) {
      throw new Error('MOCK_FALLBACK_TRIGGER');
    }
  }

  public getStatus() {
    return {
      mockMode: this.mockMode,
      totalRequests: this.totalRequests,
      tokensEstimated: this.tokensEstimated,
      agentLatencies: this.agentLatencies,
      providers: Array.from(this.providers.values()).map(p => ({
        id: p.id,
        name: p.name,
        defaultModel: p.defaultModel,
        modelsCount: p.listModels().length
      }))
    };
  }

  public resetBudget() {
    this.activeCallCount = 0;
  }
}

export const aiProviderManager = new AIProviderManager();
