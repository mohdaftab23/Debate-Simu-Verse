import { ProviderType } from '../../shared/types.ts';

export interface AIProviderModel {
  id: string;
  name: string;
  description: string;
  contextWindow?: number;
  isDefault?: boolean;
}

export interface ProviderValidationResult {
  valid: boolean;
  model: string;
  provider: ProviderType;
  error?: string;
  latencyMs?: number;
}

export interface ProviderGenerateParams {
  prompt: string;
  systemInstruction?: string;
  model: string;
  apiKey?: string;
  temperature?: number;
  maxTokens?: number;
  responseSchema?: any;
  useHighThinking?: boolean;
}

export interface ProviderGenerateResult<T = any> {
  data: T;
  rawText: string;
  provider: ProviderType;
  model: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
  latencyMs: number;
}

export interface AIProvider {
  id: ProviderType;
  name: string;
  defaultModel: string;
  listModels(): AIProviderModel[];
  validateKey(apiKey: string, model?: string): Promise<ProviderValidationResult>;
  generateJSON<T>(params: ProviderGenerateParams): Promise<ProviderGenerateResult<T>>;
  generateText(params: ProviderGenerateParams): Promise<ProviderGenerateResult<string>>;
}
