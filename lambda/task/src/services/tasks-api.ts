import axios, { AxiosInstance, AxiosError } from 'axios';
import { 
  Task, 
  TaskCreateRequest, 
  TaskUpdateRequest, 
  PaginatedTaskResponse,
  ErrorResponse 
} from '../types';

export class TasksApiService {
  private readonly client: AxiosInstance;

  constructor(apiUrl: string) {
    this.client = axios.create({
      baseURL: apiUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  private handleApiError(error: unknown): never {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ErrorResponse>;
      const errorMessage = axiosError.response?.data?.message ?? axiosError.message;
      const statusCode = axiosError.response?.status ?? 500;
      
      console.error('API Error:', {
        status: statusCode,
        message: errorMessage,
        data: JSON.stringify(axiosError.response?.data, null, 2),
        url: axiosError.config?.url,
        method: axiosError.config?.method,
        requestData: axiosError.config?.data,
      });
      
      throw new Error(errorMessage);
    }
    throw error;
  }

  async getTask(accountId: string, taskId: string, authToken?: string): Promise<Task> {
    try {
      const response = await this.client.get<Task>(
        `/tasks/${accountId}/${taskId}`,
        {
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
        }
      );
      return response.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  async createTask(accountId: string, task: TaskCreateRequest, authToken?: string): Promise<Task> {
    try {
      const response = await this.client.post<Task>(
        `/tasks/${accountId}`,
        task,
        {
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
        }
      );
      return response.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  async updateTask(accountId: string, taskId: string, updates: TaskUpdateRequest, authToken?: string): Promise<Task> {
    try {
      const response = await this.client.put<Task>(
        `/tasks/${accountId}/${taskId}`,
        updates,
        {
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
        }
      );
      return response.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  async deleteTask(accountId: string, taskId: string, authToken?: string): Promise<boolean> {
    try {
      await this.client.delete(
        `/tasks/${accountId}/${taskId}`,
        {
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
        }
      );
      return true;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  async listTasks(
    accountId: string, 
    options: { limit?: number; cursor?: string } = {},
    authToken?: string
  ): Promise<PaginatedTaskResponse> {
    try {
      const params = new URLSearchParams();
      if (options.limit !== undefined) {
        params.append('limit', options.limit.toString());
      }
      if (options.cursor !== undefined) {
        params.append('cursor', options.cursor);
      }

      const response = await this.client.get<PaginatedTaskResponse>(
        `/tasks/${accountId}`,
        {
          params,
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
        }
      );
      return response.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }
}