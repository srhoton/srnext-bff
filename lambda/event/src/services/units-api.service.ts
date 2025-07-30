import axios, { AxiosInstance, AxiosError } from 'axios';

// Unit type based on the OpenAPI schema
export interface Unit {
  id: string;
  accountId: string;
  locationId: string;
  unitType?: string;
  suggestedVin: string;
  errorCode?: string;
  possibleValues?: string;
  additionalErrorText?: string | null;
  errorText?: string;
  vehicleDescriptor?: string;
  destinationMarket?: string | null;
  make?: string;
  manufacturerName?: string;
  model?: string;
  modelYear?: string;
  plantCity?: string;
  series?: string;
  trim?: string | null;
  vehicleType?: string;
  plantCountry?: string;
  plantCompanyName?: string;
  plantState?: string;
  trim2?: string;
  series2?: string;
  note?: string;
  basePrice?: string;
  nonLandUse?: string;
  bodyClass?: string;
  doors?: string;
  windows?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
  extendedAttributes?: Array<{
    attributeName: string;
    attributeValue: string;
  }>;
  acesAttributes?: Array<{
    attributeName: string;
    attributeValue: string;
    attributeKey: string;
  }>;
}

export interface PaginatedUnitsResponse {
  items: Unit[];
  cursor?: string;
  hasMore?: boolean;
}

export interface ErrorResponse {
  error: string;
  message: string;
  path?: string;
}

export class UnitsApiService {
  private readonly client: AxiosInstance;
  private readonly baseUrl: string;

  constructor(authToken: string) {
    this.baseUrl = process.env['UNITS_API_URL'] || 'https://unit-srnext.sb.fullbay.com';
    
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

  async listUnits(
    accountId: string, 
    cursor?: string, 
    limit?: number
  ): Promise<PaginatedUnitsResponse> {
    try {
      const params: Record<string, string | number> = {};
      if (cursor) params['cursor'] = cursor;
      if (limit) params['limit'] = limit;

      const response = await this.client.get<PaginatedUnitsResponse>(
        `/units/${encodeURIComponent(accountId)}`,
        { params }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getAllUnits(accountId: string): Promise<Unit[]> {
    const allUnits: Unit[] = [];
    let cursor: string | undefined;
    let hasMore = true;

    while (hasMore) {
      const response = await this.listUnits(accountId, cursor, 100);
      allUnits.push(...response.items);
      cursor = response.cursor;
      hasMore = response.hasMore || false;
      
      // If no cursor is returned, we've reached the end
      if (!cursor) {
        break;
      }
    }

    return allUnits;
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