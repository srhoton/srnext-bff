import axios, { AxiosInstance, AxiosError } from 'axios';

import {
  Contact,
  ContactInput,
  ContactUpdate,
  PaginatedContactResponse,
  ErrorResponse,
} from '../types';

export class ContactsApiService {
  private readonly client: AxiosInstance;
  private readonly baseUrl: string;

  constructor(authToken: string) {
    this.baseUrl = process.env['CONTACTS_API_URL'] || 'https://contact-srnext.sb.fullbay.com';
    
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
      (error: AxiosError<ErrorResponse>) => {
        console.error('Response error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
        return Promise.reject(error);
      }
    );
  }

  async getContact(accountId: string, email: string): Promise<Contact> {
    try {
      const response = await this.client.get<Contact>(
        `/contacts/${encodeURIComponent(accountId)}/${encodeURIComponent(email)}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new Error(`Contact with email ${email} not found for account ${accountId}`);
      }
      throw this.handleError(error);
    }
  }

  async listContacts(
    accountId: string, 
    cursor?: string, 
    limit?: number
  ): Promise<PaginatedContactResponse> {
    try {
      const params: Record<string, string | number> = {};
      if (cursor) params['cursor'] = cursor;
      if (limit) params['limit'] = limit;

      const response = await this.client.get<PaginatedContactResponse>(
        `/contacts/${encodeURIComponent(accountId)}`,
        { params }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createContact(accountId: string, contact: ContactInput): Promise<Contact> {
    try {
      const response = await this.client.post<Contact>(
        `/contacts/${encodeURIComponent(accountId)}`,
        contact
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        const errorData = error.response.data as ErrorResponse;
        if (errorData.validationErrors) {
          const errors = Object.entries(errorData.validationErrors)
            .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
            .join('; ');
          throw new Error(`Validation failed: ${errors}`);
        }
      }
      throw this.handleError(error);
    }
  }

  async updateContact(
    accountId: string, 
    email: string, 
    updates: ContactUpdate
  ): Promise<Contact> {
    try {
      const response = await this.client.put<Contact>(
        `/contacts/${encodeURIComponent(accountId)}/${encodeURIComponent(email)}`,
        updates
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error(`Contact with email ${email} not found for account ${accountId}`);
        }
        if (error.response?.status === 400) {
          const errorData = error.response.data as ErrorResponse;
          if (errorData.validationErrors) {
            const errors = Object.entries(errorData.validationErrors)
              .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
              .join('; ');
            throw new Error(`Validation failed: ${errors}`);
          }
        }
      }
      throw this.handleError(error);
    }
  }

  async deleteContact(accountId: string, email: string): Promise<Contact> {
    try {
      // First get the contact to return it after deletion
      const contact = await this.getContact(accountId, email);
      
      // Now delete the contact
      const response = await this.client.delete<Contact>(
        `/contacts/${encodeURIComponent(accountId)}/${encodeURIComponent(email)}`
      );
      
      // If the delete response has data, use it. Otherwise, return the contact we fetched
      // but with the current timestamp as deletedAt
      if (response.data && Object.keys(response.data).length > 0) {
        return response.data;
      } else {
        // Return the contact with current timestamp as deletedAt to indicate it was deleted
        return {
          ...contact,
          deletedAt: new Date().toISOString(),
        };
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new Error(`Contact with email ${email} not found for account ${accountId}`);
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