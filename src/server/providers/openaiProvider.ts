import { AIProvider, AIProviderModel, ProviderGenerateParams, ProviderGenerateResult, ProviderValidationResult } from './types.ts';

export class OpenAIProvider implements AIProvider {
  public id = 'openai' as const;
  public name = 'OpenAI';
  public defaultModel = 'gpt-4o';

  private knownModels: AIProviderModel[] = [
    { id: 'gpt-4o', name: 'GPT-4o', description: 'Omni flagship model for high-intelligence reasoning & synthesis', isDefault: true },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Fast, affordable, high-efficiency lightweight model' },
    { id: 'o3-mini', name: 'o3-mini', description: 'Reasoning model specialized for STEM and causality' },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'Deep historical analysis and broad knowledge' }
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
          provider: 'openai',
          model: targetModel,
          error: 'OpenAI API key is too short or empty'
        };
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey.trim()}`
        },
        body: JSON.stringify({
          model: targetModel,
          messages: [
            { role: 'user', content: 'Ping. Reply with "OK".' }
          ],
          max_tokens: 5,
          temperature: 0.1
        })
      });

      const latencyMs = Date.now() - startTime;

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        const msg = errorBody?.error?.message || response.statusText;

        let userFriendly = `OpenAI error (${response.status}): ${msg}`;
        if (response.status === 401) {
          userFriendly = 'Invalid OpenAI API key. Check your API key in the OpenAI dashboard.';
        } else if (response.status === 429) {
          userFriendly = 'OpenAI rate limit or billing quota exceeded.';
        } else if (response.status === 404) {
          userFriendly = `OpenAI model "${targetModel}" not found or unauthorized for this key.`;
        }

        return {
          valid: false,
          provider: 'openai',
          model: targetModel,
          error: userFriendly,
          latencyMs
        };
      }

      const data = await response.json();
      if (data.choices && data.choices.length > 0) {
        return {
          valid: true,
          provider: 'openai',
          model: targetModel,
          latencyMs
        };
      }

      return {
        valid: false,
        provider: 'openai',
        model: targetModel,
        error: 'No completion choices returned by OpenAI API',
        latencyMs
      };
    } catch (err: any) {
      return {
        valid: false,
        provider: 'openai',
        model: targetModel,
        error: `Network error connecting to OpenAI: ${err?.message || err}`,
        latencyMs: Date.now() - startTime
      };
    }
  }

  public async generateJSON<T>(params: ProviderGenerateParams): Promise<ProviderGenerateResult<T>> {
    const startTime = Date.now();
    const targetModel = params.model || this.defaultModel;
    const apiKey = params.apiKey || process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error('MISSING_KEY: OpenAI API key not provided.');
    }

    const messages: Array<{ role: string; content: string }> = [];
    if (params.systemInstruction) {
      messages.push({ role: 'system', content: `${params.systemInstruction}\nYou MUST return ONLY valid JSON matching the requested schema. Do not include introductory text or markdown ticks.` });
    } else {
      messages.push({ role: 'system', content: 'You are an analytical simulation engine. You MUST respond ONLY with valid JSON.' });
    }
    messages.push({ role: 'user', content: params.prompt });

    const reqBody: any = {
      model: targetModel,
      messages,
      temperature: params.temperature !== undefined ? params.temperature : 0.7
    };

    // Use json_object response_format if model supports it (like gpt-4o, gpt-4o-mini, gpt-4-turbo)
    if (!targetModel.includes('o1-') && !targetModel.includes('o3-')) {
      reqBody.response_format = { type: 'json_object' };
    }

    if (params.maxTokens) {
      reqBody.max_tokens = params.maxTokens;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey.trim()}`
      },
      body: JSON.stringify(reqBody)
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      const errMsg = errJson?.error?.message || response.statusText;
      throw new Error(`OpenAI API request failed (${response.status}): ${errMsg}`);
    }

    const resData = await response.json();
    const rawContent = resData.choices?.[0]?.message?.content || '{}';
    const cleanContent = this.cleanJsonString(rawContent);
    const parsed = JSON.parse(cleanContent) as T;
    const latencyMs = Date.now() - startTime;

    return {
      data: parsed,
      rawText: cleanContent,
      provider: 'openai',
      model: targetModel,
      latencyMs,
      usage: {
        promptTokens: resData.usage?.prompt_tokens,
        completionTokens: resData.usage?.completion_tokens,
        totalTokens: resData.usage?.total_tokens
      }
    };
  }

  public async generateText(params: ProviderGenerateParams): Promise<ProviderGenerateResult<string>> {
    const startTime = Date.now();
    const targetModel = params.model || this.defaultModel;
    const apiKey = params.apiKey || process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error('MISSING_KEY: OpenAI API key not provided.');
    }

    const messages: Array<{ role: string; content: string }> = [];
    if (params.systemInstruction) {
      messages.push({ role: 'system', content: params.systemInstruction });
    }
    messages.push({ role: 'user', content: params.prompt });

    const reqBody: any = {
      model: targetModel,
      messages,
      temperature: params.temperature !== undefined ? params.temperature : 0.7
    };

    if (params.maxTokens) {
      reqBody.max_tokens = params.maxTokens;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey.trim()}`
      },
      body: JSON.stringify(reqBody)
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      const errMsg = errJson?.error?.message || response.statusText;
      throw new Error(`OpenAI API request failed (${response.status}): ${errMsg}`);
    }

    const resData = await response.json();
    const rawContent = resData.choices?.[0]?.message?.content || '';
    const latencyMs = Date.now() - startTime;

    return {
      data: rawContent,
      rawText: rawContent,
      provider: 'openai',
      model: targetModel,
      latencyMs,
      usage: {
        promptTokens: resData.usage?.prompt_tokens,
        completionTokens: resData.usage?.completion_tokens,
        totalTokens: resData.usage?.total_tokens
      }
    };
  }
}

export const openAIProvider = new OpenAIProvider();
