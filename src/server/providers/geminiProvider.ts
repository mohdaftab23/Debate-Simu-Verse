import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { AIProvider, AIProviderModel, ProviderGenerateParams, ProviderGenerateResult, ProviderValidationResult } from './types.ts';

export class GeminiProvider implements AIProvider {
  public id = 'gemini' as const;
  public name = 'Google Gemini';
  public defaultModel = 'gemini-3.7-flash';

  private knownModels: AIProviderModel[] = [
    { id: 'gemini-3.7-flash', name: 'Gemini 3.7 Flash', description: 'Fast, state-of-the-art multimodal reasoning', isDefault: true },
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', description: 'Deep analytical synthesis and complex counterfactual reasoning' },
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: 'Low-latency balanced reasoning' },
    { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite', description: 'Ultra fast lightweight execution' }
  ];

  public listModels(): AIProviderModel[] {
    return this.knownModels;
  }

  private cleanJsonString(raw: string): string {
    let clean = raw.trim();
    if (clean.startsWith('```')) {
      clean = clean.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/i, '').trim();
    }
    return clean;
  }

  public async validateKey(apiKey: string, model?: string): Promise<ProviderValidationResult> {
    const targetModel = model || this.defaultModel;
    const startTime = Date.now();
    try {
      if (!apiKey || apiKey.trim().length < 8) {
        return {
          valid: false,
          provider: 'gemini',
          model: targetModel,
          error: 'Gemini API key is too short or empty'
        };
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey.trim(),
        httpOptions: { headers: { 'User-Agent': 'aistudio-byok-test' } }
      });

      // Minimal test request (single token output)
      const res = await ai.models.generateContent({
        model: targetModel,
        contents: 'Ping. Reply with "OK".',
        config: {
          temperature: 0.1
        }
      });

      if (res.text) {
        return {
          valid: true,
          provider: 'gemini',
          model: targetModel,
          latencyMs: Date.now() - startTime
        };
      }
      return {
        valid: false,
        provider: 'gemini',
        model: targetModel,
        error: 'No text returned from Gemini API'
      };
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      let userFriendly = 'Gemini API connection failed.';
      if (errMsg.includes('API_KEY_INVALID') || errMsg.includes('API key not valid') || errMsg.includes('INVALID_ARGUMENT')) {
        userFriendly = 'Invalid Gemini API key. Please check your credentials at Google AI Studio.';
      } else if (errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('429') || errMsg.includes('Quota exceeded')) {
        userFriendly = 'Gemini rate limit or quota exceeded.';
      } else if (errMsg.includes('NOT_FOUND') || errMsg.includes('404')) {
        userFriendly = `Model "${targetModel}" not found or not permitted with this key.`;
      } else {
        userFriendly = `Gemini error: ${errMsg.slice(0, 120)}`;
      }

      return {
        valid: false,
        provider: 'gemini',
        model: targetModel,
        error: userFriendly,
        latencyMs: Date.now() - startTime
      };
    }
  }

  public async generateJSON<T>(params: ProviderGenerateParams): Promise<ProviderGenerateResult<T>> {
    const startTime = Date.now();
    const targetModel = params.model || this.defaultModel;
    const apiKey = params.apiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      throw new Error('MISSING_KEY: Google Gemini API key not provided.');
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-simulation-engine' } }
    });

    const config: any = {
      systemInstruction: params.systemInstruction,
      responseMimeType: 'application/json',
      temperature: params.temperature !== undefined ? params.temperature : 0.7
    };

    if (params.responseSchema) {
      config.responseSchema = params.responseSchema;
    }

    if (params.useHighThinking && targetModel.includes('3.1-pro')) {
      config.thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH };
    }

    const response = await ai.models.generateContent({
      model: targetModel,
      contents: params.prompt,
      config
    });

    const rawText = this.cleanJsonString(response.text || '{}');
    const parsed = JSON.parse(rawText) as T;
    const latencyMs = Date.now() - startTime;
    const estimatedTokens = Math.ceil((params.prompt.length + rawText.length) / 4);

    return {
      data: parsed,
      rawText,
      provider: 'gemini',
      model: targetModel,
      latencyMs,
      usage: {
        totalTokens: estimatedTokens
      }
    };
  }

  public async generateText(params: ProviderGenerateParams): Promise<ProviderGenerateResult<string>> {
    const startTime = Date.now();
    const targetModel = params.model || this.defaultModel;
    const apiKey = params.apiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      throw new Error('MISSING_KEY: Google Gemini API key not provided.');
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-simulation-engine' } }
    });

    const response = await ai.models.generateContent({
      model: targetModel,
      contents: params.prompt,
      config: {
        systemInstruction: params.systemInstruction,
        temperature: params.temperature !== undefined ? params.temperature : 0.7
      }
    });

    const rawText = response.text || '';
    const latencyMs = Date.now() - startTime;
    const estimatedTokens = Math.ceil((params.prompt.length + rawText.length) / 4);

    return {
      data: rawText,
      rawText,
      provider: 'gemini',
      model: targetModel,
      latencyMs,
      usage: {
        totalTokens: estimatedTokens
      }
    };
  }
}

export const geminiProvider = new GeminiProvider();
