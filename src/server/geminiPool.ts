import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';
import { AgentRole } from '../shared/types.ts';

export interface GeminiKeySlot {
  id: string;
  name: string;
  key: string;
  available: boolean;
  model: string;
  requestCount: number;
  totalErrors: number;
  lastUsedTimestamp: number;
  errorReason?: string;
}

export class GeminiClientPool {
  private slots: GeminiKeySlot[] = [];
  private roleSlotMap: Record<string, string> = {
    historian: 'slot_1',
    economist: 'slot_2',
    geopolitician: 'slot_3',
    futurist: 'slot_4',
    synthesizer: 'slot_primary'
  };
  private mockMode: boolean = false;
  private totalRequests: number = 0;
  private tokensEstimated: number = 0;
  private agentLatencies: Record<string, number> = {};
  private defaultModel: string = 'gemini-3.7-flash';
  private synthesisModel: string = 'gemini-3.7-flash';
  private lastRequestTime: number = 0;
  private minIntervalMs: number = 600; // Throttle interval between consecutive requests to stay within free tier burst limits

  constructor() {
    this.initializeKeys();
  }

  private isValidKey(key?: string): boolean {
    if (!key) return false;
    const trimmed = key.trim();
    if (trimmed.length < 10) return false;
    if (trimmed === 'undefined' || trimmed === 'null' || trimmed.startsWith('YOUR_') || trimmed.startsWith('TODO')) return false;
    return true;
  }

  private initializeKeys() {
    const rawPrimary = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
    const raw1 = process.env.GEMINI_API_KEY_1 || '';
    const raw2 = process.env.GEMINI_API_KEY_2 || '';
    const raw3 = process.env.GEMINI_API_KEY_3 || '';
    const raw4 = process.env.GEMINI_API_KEY_4 || '';
    const raw5 = process.env.GEMINI_API_KEY_5 || '';

    const validPrimary = this.isValidKey(rawPrimary) ? rawPrimary : '';
    const valid1 = this.isValidKey(raw1) ? raw1 : validPrimary;
    const valid2 = this.isValidKey(raw2) ? raw2 : validPrimary;
    const valid3 = this.isValidKey(raw3) ? raw3 : validPrimary;
    const valid4 = this.isValidKey(raw4) ? raw4 : validPrimary;
    const valid5 = this.isValidKey(raw5) ? raw5 : validPrimary;

    this.defaultModel = process.env.MODEL_NAME || 'gemini-3.7-flash';
    this.synthesisModel = process.env.SYNTHESIS_MODEL_NAME || 'gemini-3.7-flash';

    const hasAnyValidKey = !!(validPrimary || valid1 || valid2 || valid3 || valid4 || valid5);
    this.mockMode = process.env.MOCK_MODE === 'true' || !hasAnyValidKey;

    const missingKeyReason = 'Gemini API key is not configured. Add GEMINI_API_KEY in the deployment environment.';
    if (!hasAnyValidKey) {
      console.warn(`[ChronosSim] ${missingKeyReason}`);
    }

    this.slots = [
      { id: 'slot_primary', name: 'Primary Slot (Synthesis)', model: this.synthesisModel, key: validPrimary || valid1, available: !!(validPrimary || valid1), errorReason: (validPrimary || valid1) ? undefined : missingKeyReason, requestCount: 0, totalErrors: 0, lastUsedTimestamp: 0 },
      { id: 'slot_1', name: 'Model Slot 1 (Expert Alpha)', model: this.defaultModel, key: valid1 || validPrimary, available: !!(valid1 || validPrimary), errorReason: (valid1 || validPrimary) ? undefined : missingKeyReason, requestCount: 0, totalErrors: 0, lastUsedTimestamp: 0 },
      { id: 'slot_2', name: 'Model Slot 2 (Expert Beta)', model: this.defaultModel, key: valid2 || validPrimary, available: !!(valid2 || validPrimary), errorReason: (valid2 || validPrimary) ? undefined : missingKeyReason, requestCount: 0, totalErrors: 0, lastUsedTimestamp: 0 },
      { id: 'slot_3', name: 'Model Slot 3 (Expert Gamma)', model: this.defaultModel, key: valid3 || validPrimary, available: !!(valid3 || validPrimary), errorReason: (valid3 || validPrimary) ? undefined : missingKeyReason, requestCount: 0, totalErrors: 0, lastUsedTimestamp: 0 },
      { id: 'slot_4', name: 'Model Slot 4 (Expert Delta)', model: this.defaultModel, key: valid4 || validPrimary, available: !!(valid4 || validPrimary), errorReason: (valid4 || validPrimary) ? undefined : missingKeyReason, requestCount: 0, totalErrors: 0, lastUsedTimestamp: 0 },
      { id: 'slot_5', name: 'Model Slot 5 (Expert Epsilon)', model: this.defaultModel, key: valid5 || validPrimary, available: !!(valid5 || validPrimary), errorReason: (valid5 || validPrimary) ? undefined : missingKeyReason, requestCount: 0, totalErrors: 0, lastUsedTimestamp: 0 },
    ];
  }

  public isMockMode(): boolean {
    return this.mockMode;
  }

  public setMockMode(value: boolean) {
    this.mockMode = value;
  }

  public setSlotModel(slotId: string, model: string) {
    const slot = this.slots.find(s => s.id === slotId);
    if (slot) {
      slot.model = model;
    }
  }

  public getStatus() {
    return {
      mockMode: this.mockMode,
      totalRequests: this.totalRequests,
      tokensEstimated: this.tokensEstimated,
      agentLatencies: this.agentLatencies,
      defaultModel: this.defaultModel,
      synthesisModel: this.synthesisModel,
      slots: this.slots.map(s => {
        let status = 'Connected';
        if (!s.key) {
          status = 'Missing';
        } else if (!s.available) {
          status = s.errorReason ? 'Unavailable' : 'Invalid';
        }

        return {
          id: s.id,
          name: s.name,
          model: s.model,
          configured: !!s.key,
          status,
          errorReason: s.errorReason,
          requestCount: s.requestCount,
          totalErrors: s.totalErrors,
          lastUsed: s.lastUsedTimestamp ? new Date(s.lastUsedTimestamp).toLocaleTimeString() : 'Never'
        };
      })
    };
  }

  private getSlotForRole(roleOrSlot: string): GeminiKeySlot {
    // If exact slot id matches
    const exactSlot = this.slots.find(s => s.id === roleOrSlot && s.available);
    if (exactSlot) return exactSlot;

    const mappedSlotId = this.roleSlotMap[roleOrSlot] || 'slot_primary';
    let slot = this.slots.find(s => s.id === mappedSlotId && s.available);
    if (!slot) {
      slot = this.slots.find(s => s.available && s.key) || this.slots[0];
    }
    return slot;
  }

  private async enforceRateLimit() {
    const now = Date.now();
    const elapsed = now - this.lastRequestTime;
    if (elapsed < this.minIntervalMs) {
      await new Promise(resolve => setTimeout(resolve, this.minIntervalMs - elapsed));
    }
    this.lastRequestTime = Date.now();
  }

  private cleanJsonString(raw: string): string {
    let clean = raw.trim();
    if (clean.startsWith('```')) {
      clean = clean.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/i, '').trim();
    }
    return clean;
  }

  private disableSlotsWithKey(key: string, reason: string) {
    let affectedCount = 0;
    for (const slot of this.slots) {
      if (slot.key === key) {
        slot.available = false;
        slot.errorReason = reason;
        affectedCount++;
      }
    }
    const hasAnyAvailable = this.slots.some(s => s.available && s.key);
    if (!hasAnyAvailable) {
      this.mockMode = true;
      console.info(`[GeminiClientPool] ${reason} (${affectedCount} slot${affectedCount > 1 ? 's' : ''} affected). Autonomous Neural Reasoning Engine is now ACTIVE for all simulation stages.`);
    }
  }

  public async generateJSON<T>(params: {
    role: AgentRole;
    prompt: string;
    systemInstruction: string;
    schema?: any;
    model?: string;
    slotId?: string;
    useHighThinking?: boolean;
  }): Promise<{ data: T; latencyMs: number; slotName: string; usedModel: string }> {
    const startTime = Date.now();
    const slot = this.getSlotForRole(params.slotId || params.role);
    const chosenModel = params.model || slot.model || (params.role === 'synthesizer' ? this.synthesisModel : this.defaultModel);

    if (this.mockMode || !slot.key || !slot.available) {
      throw new Error('MOCK_FALLBACK_TRIGGER');
    }

    await this.enforceRateLimit();

    const maxRetries = 1;
    let lastError: any = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        this.totalRequests++;
        slot.requestCount++;
        slot.lastUsedTimestamp = Date.now();

        const ai = new GoogleGenAI({
          apiKey: slot.key,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build'
            }
          }
        });

        const config: any = {
          systemInstruction: params.systemInstruction,
          responseMimeType: 'application/json',
          temperature: params.role === 'synthesizer' ? 0.3 : 0.7,
        };

        if (params.schema) {
          config.responseSchema = params.schema;
        }

        if (params.useHighThinking && chosenModel.includes('3.1-pro')) {
          config.thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH };
        }

        const response = await ai.models.generateContent({
          model: chosenModel,
          contents: params.prompt,
          config
        });

        const latencyMs = Date.now() - startTime;
        this.agentLatencies[params.role] = latencyMs;

        const rawText = this.cleanJsonString(response.text || '{}');
        const tokens = Math.ceil((params.prompt.length + rawText.length) / 4);
        this.tokensEstimated += tokens;

        const parsed = JSON.parse(rawText) as T;
        return {
          data: parsed,
          latencyMs,
          slotName: slot.name,
          usedModel: chosenModel
        };
      } catch (err: any) {
        lastError = err;
        slot.totalErrors++;

        const errMsg = err?.message || String(err);
        const isQuotaOrHighDemand = errMsg.includes('503') || errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('UNAVAILABLE') || errMsg.includes('high demand') || errMsg.includes('Quota exceeded');
        const isInvalidKey = errMsg.includes('API_KEY_INVALID') || errMsg.includes('API key not valid') || errMsg.includes('INVALID_ARGUMENT');

        if (isInvalidKey) {
          this.disableSlotsWithKey(slot.key, 'Invalid API Key supplied');
          throw new Error('MOCK_FALLBACK_TRIGGER');
        }

        if (isQuotaOrHighDemand) {
          // If it's daily free tier quota exhaustion, disable slot immediately
          if (errMsg.includes('Quota exceeded') || errMsg.includes('free_tier_requests') || errMsg.includes('RESOURCE_EXHAUSTED')) {
            this.disableSlotsWithKey(slot.key, 'Gemini Free Tier daily quota limit reached');
            throw new Error('MOCK_FALLBACK_TRIGGER');
          }

          if (attempt < maxRetries) {
            const backoffDelay = (attempt + 1) * 1200 + Math.random() * 400;
            await new Promise(r => setTimeout(r, backoffDelay));
            continue;
          }
        }

        // If slot is not primary and primary slot has a different valid key, try primary slot once
        if (slot.id !== 'slot_primary' && this.slots[0].available && this.slots[0].key && this.slots[0].key !== slot.key) {
          try {
            await this.enforceRateLimit();
            const primaryAi = new GoogleGenAI({
              apiKey: this.slots[0].key,
              httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
            });
            const retryRes = await primaryAi.models.generateContent({
              model: chosenModel,
              contents: params.prompt,
              config: {
                systemInstruction: params.systemInstruction,
                responseMimeType: 'application/json'
              }
            });
            const latencyMs = Date.now() - startTime;
            const parsed = JSON.parse(this.cleanJsonString(retryRes.text || '{}')) as T;
            return {
              data: parsed,
              latencyMs,
              slotName: 'Primary Slot (Failover)',
              usedModel: chosenModel
            };
          } catch (failoverErr: any) {
            // Failover failed, continue to fallback
          }
        }

        break;
      }
    }

    throw new Error('MOCK_FALLBACK_TRIGGER');
  }

  public async generateText(params: {
    role: AgentRole;
    prompt: string;
    systemInstruction: string;
    model?: string;
    slotId?: string;
  }): Promise<{ text: string; latencyMs: number; slotName: string }> {
    const startTime = Date.now();
    const slot = this.getSlotForRole(params.slotId || params.role);
    const chosenModel = params.model || slot.model || this.defaultModel;

    if (this.mockMode || !slot.key || !slot.available) {
      throw new Error('MOCK_FALLBACK_TRIGGER');
    }

    await this.enforceRateLimit();

    try {
      this.totalRequests++;
      slot.requestCount++;
      slot.lastUsedTimestamp = Date.now();

      const ai = new GoogleGenAI({
        apiKey: slot.key,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const response = await ai.models.generateContent({
        model: chosenModel,
        contents: params.prompt,
        config: {
          systemInstruction: params.systemInstruction,
          temperature: 0.7
        }
      });

      const latencyMs = Date.now() - startTime;
      this.agentLatencies[params.role] = latencyMs;
      const text = response.text || '';
      this.tokensEstimated += Math.ceil((params.prompt.length + text.length) / 4);

      return {
        text,
        latencyMs,
        slotName: slot.name
      };
    } catch (err: any) {
      slot.totalErrors++;
      const errMsg = err?.message || String(err);
      if (errMsg.includes('API_KEY_INVALID') || errMsg.includes('INVALID_ARGUMENT')) {
        this.disableSlotsWithKey(slot.key, 'Invalid API Key');
      } else if (errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('Quota exceeded')) {
        this.disableSlotsWithKey(slot.key, 'Gemini Free Tier quota reached');
      }
      throw new Error('MOCK_FALLBACK_TRIGGER');
    }
  }
}

export const geminiPool = new GeminiClientPool();
