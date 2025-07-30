import axios, { AxiosInstance, AxiosError } from 'axios';

import {
  Account,
  AccountCreate,
  AccountPartialUpdate,
  AccountPageResponse,
  ErrorResponse,
  ValidationErrorResponse,
} from '../types';

export class AccountsApiService {
  private readonly client: AxiosInstance;
  private readonly baseUrl: string;

  constructor(authToken: string) {
    this.baseUrl = process.env['ACCOUNTS_API_URL'] || 'https://account-srnext.sb.fullbay.com';
    
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      timeout: 30000, // 30 seconds
    });

    // Add request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        console.log(`Making request to ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ErrorResponse | ValidationErrorResponse>) => {
        console.error('Response error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
        return Promise.reject(error);
      }
    );
  }

  async getAccount(accountId: string): Promise<Account> {
    try {
      const response = await this.client.get<Account>(`/accounts/${accountId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new Error(`Account with ID ${accountId} not found`);
      }
      throw this.handleError(error);
    }
  }

  async listAccounts(cursor?: string, limit?: number): Promise<AccountPageResponse> {
    try {
      const params: Record<string, string | number> = {};
      if (cursor) params['cursor'] = cursor;
      if (limit) params['limit'] = limit;

      const response = await this.client.get<AccountPageResponse>('/accounts', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createAccount(account: AccountCreate): Promise<Account> {
    try {
      const response = await this.client.post<Account>('/accounts', account);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        const validationError = error.response.data as ValidationErrorResponse;
        if (validationError.validationErrors) {
          const errors = validationError.validationErrors
            .map((err) => `${err.field}: ${err.message}`)
            .join(', ');
          throw new Error(`Validation failed: ${errors}`);
        }
      }
      throw this.handleError(error);
    }
  }

  async updateAccount(accountId: string, updates: AccountPartialUpdate): Promise<Account> {
    try {
      const response = await this.client.put<Account>(`/accounts/${accountId}`, updates);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error(`Account with ID ${accountId} not found`);
        }
        if (error.response?.status === 400) {
          const validationError = error.response.data as ValidationErrorResponse;
          if (validationError.validationErrors) {
            const errors = validationError.validationErrors
              .map((err) => `${err.field}: ${err.message}`)
              .join(', ');
            throw new Error(`Validation failed: ${errors}`);
          }
        }
      }
      throw this.handleError(error);
    }
  }

  async deleteAccount(accountId: string): Promise<void> {
    try {
      await this.client.delete(`/accounts/${accountId}`);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new Error(`Account with ID ${accountId} not found`);
      }
      throw this.handleError(error);
    }
  }

  private handleError(error: unknown): Error {
    if (axios.isAxiosError(error)) {
      const response = error.response;
      if (response?.data) {
        const errorData = response.data as ErrorResponse;
        return new Error(`${errorData.error}: ${errorData.message}`);
      }
      return new Error(`API request failed: ${error.message}`);
    }
    return error instanceof Error ? error : new Error('Unknown error occurred');
  }
}