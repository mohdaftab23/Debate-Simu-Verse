import { AIProvider, AIProviderModel, ProviderGenerateParams, ProviderGenerateResult, ProviderValidationResult } from './types.ts';

export class AnthropicProvider implements AIProvider {
  public id = 'anthropic' as const;
  public name = 'Anthropic';
  public defaultModel = 'claude-3-7-sonnet-20250219';

  private knownModels: AIProviderModel[] = [
    { id: 'claude-3-7-sonnet-20250219', name: 'Claude 3.7 Sonnet', description: 'Flagship hybrid reasoning and nuanced narrative synthesis', isDefault: true },
    { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', description: 'High-capability analytical intelligence & debate depth' },
    { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', description: 'Fast, cost-effective responsive reasoning' },
    { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', description: 'Complex deep-dive philosophical & historical evaluation' }
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
          provider: 'anthropic',
          model: targetModel,
          error: 'Anthropic API key is too short or empty'
        };
      }

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey.trim(),
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: targetModel,
          max_tokens: 5,
          messages: [
            { role: 'user', content: 'Ping. Reply with "OK".' }
          ]
        })
      });

      const latencyMs = Date.now() - startTime;

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        const msg = errorBody?.error?.message || response.statusText;

        let userFriendly = `Anthropic error (${response.status}): ${msg}`;
        if (response.status === 401) {
          userFriendly = 'Invalid Anthropic API key. Check your API key in the Anthropic Console.';
        } else if (response.status === 429) {
          userFriendly = 'Anthropic rate limit or credit balance exhausted.';
        } else if (response.status === 400 && msg.includes('credit')) {
          userFriendly = 'Anthropic credit balance is too low to run simulations.';
        }

        return {
          valid: false,
          provider: 'anthropic',
          model: targetModel,
          error: userFriendly,
          latencyMs
        };
      }

      const data = await response.json();
      if (data.content && data.content.length > 0) {
        return {
          valid: true,
          provider: 'anthropic',
          model: targetModel,
          latencyMs
        };
      }

      return {
        valid: false,
        provider: 'anthropic',
        model: targetModel,
        error: 'No text content returned from Anthropic API',
        latencyMs
      };
    } catch (err: any) {
      return {
        valid: false,
        provider: 'anthropic',
        model: targetModel,
        error: `Network error connecting to Anthropic: ${err?.message || err}`,
        latencyMs: Date.now() - startTime
      };
    }
  }

  public async generateJSON<T>(params: ProviderGenerateParams): Promise<ProviderGenerateResult<T>> {
    const startTime = Date.now();
    const targetModel = params.model || this.defaultModel;
    const apiKey = params.apiKey || process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      throw new Error('MISSING_KEY: Anthropic API key not provided.');
    }

    const systemPrompt = `${params.systemInstruction || 'You are an analytical simulation engine.'}\nYou MUST reply ONLY with valid raw JSON. Do not include markdown code block backticks (\`\`\`) or commentary outside the JSON object.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey.trim(),
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: targetModel,
        system: systemPrompt,
        max_tokens: params.maxTokens || 4096,
        temperature: params.temperature !== undefined ? params.temperature : 0.7,
        messages: [
          { role: 'user', content: params.prompt }
        ]
      })
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      const errMsg = errJson?.error?.message || response.statusText;
      throw new Error(`Anthropic API request failed (${response.status}): ${errMsg}`);
    }

    const resData = await response.json();
    const rawContent = resData.content?.[0]?.text || '{}';
    const cleanContent = this.cleanJsonString(rawContent);
    const parsed = JSON.parse(cleanContent) as T;
    const latencyMs = Date.now() - startTime;

    return {
      data: parsed,
      rawText: cleanContent,
      provider: 'anthropic',
      model: targetModel,
      latencyMs,
      usage: {
        promptTokens: resData.usage?.input_tokens,
        completionTokens: resData.usage?.output_tokens,
        totalTokens: (resData.usage?.input_tokens || 0) + (resData.usage?.output_tokens || 0)
      }
    };
  }

  public async generateText(params: ProviderGenerateParams): Promise<ProviderGenerateResult<string>> {
    const startTime = Date.now();
    const targetModel = params.model || this.defaultModel;
    const apiKey = params.apiKey || process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      throw new Error('MISSING_KEY: Anthropic API key not provided.');
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey.trim(),
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: targetModel,
        system: params.systemInstruction || undefined,
        max_tokens: params.maxTokens || 4096,
        temperature: params.temperature !== undefined ? params.temperature : 0.7,
        messages: [
          { role: 'user', content: params.prompt }
        ]
      })
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      const errMsg = errJson?.error?.message || response.statusText;
      throw new Error(`Anthropic API request failed (${response.status}): ${errMsg}`);
    }

    const resData = await response.json();
    const rawContent = resData.content?.[0]?.text || '';
    const latencyMs = Date.now() - startTime;

    return {
      data: rawContent,
      rawText: rawContent,
      provider: 'anthropic',
      model: targetModel,
      latencyMs,
      usage: {
        promptTokens: resData.usage?.input_tokens,
        completionTokens: resData.usage?.output_tokens,
        totalTokens: (resData.usage?.input_tokens || 0) + (resData.usage?.output_tokens || 0)
      }
    };
  }
}

export const anthropicProvider = new AnthropicProvider();
