export interface Project {
  id: string;
  name: string;
  prompt: string;
  versions: ProjectVersion[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectVersion {
  id: string;
  prompt: string;
  responses: ModelResponse[];
  createdAt: string;
}

export interface ModelResponse {
  modelName: string;
  content: string;
  tokenUsage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  createdAt: string;
}

export interface ModelConfig {
  name: string;
  apiEndpoint: string;
  apiKey: string;
  enabled: boolean;
  modelName: string; // API 请求中使用的实际模型名称
}
