import axios, { AxiosInstance, AxiosError } from 'axios';
import { Part, PartCreateInput, PartUpdateInput } from '../types/part';
import { PartListApiResponse, PartApiResponse, DeleteApiResponse } from '../types/responses';

export class PartsApiService {
  private readonly apiClient: AxiosInstance;

  constructor(baseUrl: string) {
    this.apiClient = axios.create({
      baseURL: baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  private handleApiError(error: unknown): never {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      const errorData = axiosError.response?.data as { error?: { message?: string } } | undefined;
      const message = errorData?.error?.message ?? axiosError.message;
      console.error('API Error:', {
        status: axiosError.response?.status,
        message,
        data: axiosError.response?.data,
      });
      throw new Error(message);
    }
    throw error;
  }

  async listParts(
    accountId: string,
    options: {
      locationId?: string;
      unitId?: string;
      limit?: number;
      cursor?: string;
    } = {},
    jwtToken?: string
  ): Promise<PartListApiResponse> {
    try {
      const params = new URLSearchParams();
      if (options.locationId) {
        params.append('locationId', options.locationId);
      }
      if (options.unitId) {
        params.append('unitId', options.unitId);
      }
      if (options.limit) {
        params.append('limit', options.limit.toString());
      }
      if (options.cursor) {
        params.append('cursor', options.cursor);
      }

      const headers: Record<string, string> = {};
      if (jwtToken) {
        headers['Authorization'] = `Bearer ${jwtToken}`;
      }

      const response = await this.apiClient.get<PartListApiResponse>(
        `/parts/${accountId}`,
        {
          params,
          headers,
        }
      );

      return response.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  async getPart(
    accountId: string,
    sortKey: string,
    jwtToken?: string
  ): Promise<Part> {
    try {
      const headers: Record<string, string> = {};
      if (jwtToken) {
        headers['Authorization'] = `Bearer ${jwtToken}`;
      }

      const response = await this.apiClient.get<PartApiResponse>(
        `/parts/${accountId}/${encodeURIComponent(sortKey)}`,
        { headers }
      );

      if (!response.data.success || !response.data.data) {
        throw new Error('Invalid response from parts API');
      }

      return response.data.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  async createPart(
    accountId: string,
    input: PartCreateInput,
    jwtToken?: string
  ): Promise<Part> {
    try {
      const headers: Record<string, string> = {};
      if (jwtToken) {
        headers['Authorization'] = `Bearer ${jwtToken}`;
      }

      const response = await this.apiClient.post<PartApiResponse>(
        `/parts/${accountId}`,
        input,
        { headers }
      );

      if (!response.data.success || !response.data.data) {
        throw new Error('Invalid response from parts API');
      }

      return response.data.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  async updatePart(
    accountId: string,
    sortKey: string,
    input: PartUpdateInput,
    jwtToken?: string
  ): Promise<Part> {
    try {
      const headers: Record<string, string> = {};
      if (jwtToken) {
        headers['Authorization'] = `Bearer ${jwtToken}`;
      }

      const response = await this.apiClient.put<PartApiResponse>(
        `/parts/${accountId}/${encodeURIComponent(sortKey)}`,
        input,
        { headers }
      );

      if (!response.data.success || !response.data.data) {
        throw new Error('Invalid response from parts API');
      }

      return response.data.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  async deletePart(
    accountId: string,
    sortKey: string,
    jwtToken?: string
  ): Promise<boolean> {
    try {
      const headers: Record<string, string> = {};
      if (jwtToken) {
        headers['Authorization'] = `Bearer ${jwtToken}`;
      }

      const response = await this.apiClient.delete<DeleteApiResponse>(
        `/parts/${accountId}/${encodeURIComponent(sortKey)}`,
        { headers }
      );

      return response.data.success === true;
    } catch (error) {
      this.handleApiError(error);
    }
  }
}