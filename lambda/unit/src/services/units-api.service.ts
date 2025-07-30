import axios, { AxiosInstance, AxiosError } from "axios";

import {
  Unit,
  PaginatedResponse,
  ErrorResponse,
  ListUnitsParams,
  GetUnitParams,
  CreateUnitParams,
  UpdateUnitParams,
  DeleteUnitParams,
} from "../types";
import { ServiceError } from "../types/appsync";

export class UnitsApiService {
  private readonly client: AxiosInstance;
  private readonly baseUrl: string;

  constructor(authToken: string) {
    this.baseUrl = process.env["UNITS_API_URL"] ?? "https://unit-srnext.sb.fullbay.com";
    
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      timeout: 30000, // 30 seconds
    });
  }

  /**
   * List units for an account
   */
  async listUnits(params: ListUnitsParams): Promise<PaginatedResponse> {
    try {
      const response = await this.client.get<PaginatedResponse>(
        `/units/${params.accountId}`,
        {
          params: {
            cursor: params.cursor,
            limit: params.limit,
          },
        },
      );
      return response.data;
    } catch (error) {
      throw this.handleApiError(error as AxiosError);
    }
  }

  /**
   * Get a specific unit
   */
  async getUnit(params: GetUnitParams): Promise<Unit> {
    try {
      const response = await this.client.get<Unit>(
        `/units/${params.accountId}/${params.id}`,
      );
      return response.data;
    } catch (error) {
      throw this.handleApiError(error as AxiosError);
    }
  }

  /**
   * Create a new unit
   */
  async createUnit(params: CreateUnitParams): Promise<Unit> {
    try {
      const response = await this.client.post<Unit>(
        `/units/${params.accountId}`,
        params.unit,
      );
      return response.data;
    } catch (error) {
      throw this.handleApiError(error as AxiosError);
    }
  }

  /**
   * Update a unit (partial update/merge)
   */
  async updateUnit(params: UpdateUnitParams): Promise<Unit> {
    try {
      const response = await this.client.put<Unit>(
        `/units/${params.accountId}/${params.id}`,
        params.unit,
      );
      return response.data;
    } catch (error) {
      throw this.handleApiError(error as AxiosError);
    }
  }

  /**
   * Soft delete a unit
   */
  async deleteUnit(params: DeleteUnitParams): Promise<void> {
    try {
      await this.client.delete(`/units/${params.accountId}/${params.id}`);
    } catch (error) {
      throw this.handleApiError(error as AxiosError);
    }
  }

  /**
   * Handle API errors and convert them to appropriate error types
   */
  private handleApiError(error: AxiosError): Error {
    if (error.response) {
      const data = error.response.data as ErrorResponse;
      const message = data.error ?? "An error occurred";
      const statusCode = error.response.status;

      if (statusCode === 400) {
        return new ServiceError(`Validation error: ${message}`, statusCode);
      }
      if (statusCode === 404) {
        return new ServiceError(`Not found: ${message}`, statusCode);
      }
      if (statusCode === 401 || statusCode === 403) {
        return new ServiceError(`Unauthorized: ${message}`, statusCode);
      }

      return new ServiceError(
        `Service error: ${message}`,
        statusCode,
      );
    }

    if (error.code === "ECONNABORTED") {
      return new ServiceError("Request timeout", 408);
    }

    return new ServiceError(
      error.message ?? "Unknown error occurred",
      500,
    );
  }
}