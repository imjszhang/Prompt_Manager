import { ModelConfig, ModelResponse } from '../types';

// OpenAI 兼容的 API 响应格式
interface APIResponse {
  id?: string;
  choices: {
    message: {
      content: string;
    };
    index?: number;
    finish_reason?: string;
  }[];
  usage: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens: number;
  };
}

export class APIService {
  private static instance: APIService;

  private constructor() {}

  static getInstance(): APIService {
    if (!APIService.instance) {
      APIService.instance = new APIService();
    }
    return APIService.instance;
  }

  private static getProxyUrl() {
    // 从命令行参数获取代理端口
    const port = window.process.argv.find(arg => arg.startsWith('--proxy-port='))?.split('=')[1];
    return `http://127.0.0.1:${port}`;
  }

  async sendRequest(prompt: string, model: ModelConfig): Promise<ModelResponse> {
    try {
      const proxyUrl = APIService.getProxyUrl();
      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${model.apiKey}`,
          'X-Target-URL': model.apiEndpoint, // 添加目标 URL 到请求头
        },
        body: JSON.stringify({
          model: model.modelName,
          messages: [{
            role: 'user',
            content: prompt
          }],
          temperature: 0.7,
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorText = errorData?.error?.message || `HTTP error! status: ${response.status}`;
        console.error('API Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          model: model.name,
        });
        throw new Error(`API 请求失败 (${response.status}): ${errorText}`);
      }

      const data: APIResponse = await response.json();
      
      if (!data.choices?.[0]?.message?.content) {
        console.error('无效的 API 响应:', data);
        throw new Error('API 响应格式无效');
      }

      return {
        modelName: model.name,
        content: data.choices[0].message.content,
        tokenUsage: {
          promptTokens: data.usage?.prompt_tokens || 0,
          completionTokens: data.usage?.completion_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0,
        },
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('API 请求失败:', {
        error,
        model: model.name,
        endpoint: model.apiEndpoint
      });
      throw error instanceof Error 
        ? error 
        : new Error('未知错误发生在 API 请求中');
    }
  }

  async validateAPIKey(model: ModelConfig): Promise<boolean> {
    try {
      await this.sendRequest('Hello', model);
      return true;
    } catch (error) {
      console.error('API 验证错误:', error);
      return false;
    }
  }
}
