import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  WorkOrder,
  CreateWorkOrderRequest,
  UpdateWorkOrderRequest,
  PaginatedWorkOrderResponse,
  ProblemDetail,
} from '../types';

export class WorkOrdersApiService {
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
      const axiosError = error as AxiosError<ProblemDetail>;
      const problemDetail = axiosError.response?.data;
      
      if (problemDetail?.detail) {
        throw new Error(problemDetail.detail);
      }
      
      const errorMessage = axiosError.response?.statusText ?? axiosError.message;
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

  async getWorkOrder(accountId: string, workOrderId: string, authToken?: string): Promise<WorkOrder> {
    try {
      const response = await this.client.get<WorkOrder>(
        `/accounts/${accountId}/work-orders/${workOrderId}`,
        {
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
        }
      );
      return response.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  async createWorkOrder(accountId: string, workOrder: CreateWorkOrderRequest, authToken?: string): Promise<WorkOrder> {
    try {
      // Generate missing fields that the backend requires
      const workOrderId = workOrder.workOrderId || this.generateUuid();
      const now = Date.now();
      
      const fullWorkOrder = {
        ...workOrder,
        workOrderId,
        accountId,
        createdAt: now,
        updatedAt: now,
      };
      
      const response = await this.client.post<WorkOrder>(
        `/accounts/${accountId}/work-orders`,
        fullWorkOrder,
        {
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
        }
      );
      return response.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }
  
  private generateUuid(): string {
    // Simple UUID v4 generator
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  async updateWorkOrder(accountId: string, workOrderId: string, updates: UpdateWorkOrderRequest, authToken?: string): Promise<WorkOrder> {
    try {
      const response = await this.client.put<WorkOrder>(
        `/accounts/${accountId}/work-orders/${workOrderId}`,
        updates,
        {
          headers: authToken 
            ? { 
                Authorization: `Bearer ${authToken}`,
                'Content-Type': 'application/merge-patch+json'
              } 
            : {
                'Content-Type': 'application/merge-patch+json'
              },
        }
      );
      return response.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  async deleteWorkOrder(accountId: string, workOrderId: string, authToken?: string): Promise<boolean> {
    try {
      await this.client.delete(
        `/accounts/${accountId}/work-orders/${workOrderId}`,
        {
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
        }
      );
      return true;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  async listWorkOrders(
    accountId: string,
    options: { pageSize?: number; cursor?: string } = {},
    authToken?: string
  ): Promise<PaginatedWorkOrderResponse> {
    try {
      const params = new URLSearchParams();
      
      if (options.pageSize !== undefined) {
        params.append('pageSize', options.pageSize.toString());
      }
      
      if (options.cursor !== undefined) {
        params.append('cursor', options.cursor);
      }
      
      const response = await this.client.get<PaginatedWorkOrderResponse>(
        `/accounts/${accountId}/work-orders`,
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