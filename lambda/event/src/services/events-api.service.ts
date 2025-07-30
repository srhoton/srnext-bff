import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  UnitEvent,
  CreateEventInput,
  UpdateEventInput,
  ListEventsParams,
  GetEventParams,
  UpdateEventParams,
  DeleteEventParams,
  PagedEventResponse,
  ServiceError,
} from '../types';

interface ErrorResponse {
  error: string;
  message: string;
  details?: string[];
  path?: string;
  timestamp: string;
}

export class EventsApiService {
  private readonly client: AxiosInstance;
  private readonly baseUrl: string;

  constructor(authToken: string) {
    this.baseUrl = process.env['EVENTS_API_URL'] || 'https://event-srnext.sb.fullbay.com';
    
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      timeout: 30000,
    });

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

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ErrorResponse>) => {
        console.error('Response error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
        return Promise.reject(this.handleError(error));
      }
    );
  }

  async createEvent(input: CreateEventInput): Promise<UnitEvent> {
    try {
      const response = await this.client.post<UnitEvent>('/events', input);
      return response.data;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  async getEvent(params: GetEventParams): Promise<UnitEvent> {
    try {
      const response = await this.client.get<UnitEvent>(
        `/events/${encodeURIComponent(params.accountId)}/${encodeURIComponent(params.eventId)}`
      );
      return response.data;
    } catch (error) {
      console.error('Error getting event:', error);
      throw error;
    }
  }

  async listEvents(params: ListEventsParams): Promise<PagedEventResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.unitId) queryParams.append('unitId', params.unitId);
      if (params.eventCategory) queryParams.append('eventCategory', params.eventCategory);
      if (params.status) queryParams.append('status', params.status);
      if (params.severity) queryParams.append('severity', params.severity);
      if (params.priority) queryParams.append('priority', params.priority);
      if (params.sourceSystem) queryParams.append('sourceSystem', params.sourceSystem);
      if (params.from) queryParams.append('from', params.from);
      if (params.to) queryParams.append('to', params.to);
      if (params.cursor) queryParams.append('cursor', params.cursor);
      if (params.limit) queryParams.append('limit', params.limit.toString());

      const url = `/events/${encodeURIComponent(params.accountId)}${
        queryParams.toString() ? `?${queryParams.toString()}` : ''
      }`;

      const response = await this.client.get<PagedEventResponse>(url);
      return response.data;
    } catch (error) {
      console.error('Error listing events:', error);
      throw error;
    }
  }

  async updateEvent(params: UpdateEventParams, input: UpdateEventInput): Promise<UnitEvent> {
    try {
      const response = await this.client.put<UnitEvent>(
        `/events/${encodeURIComponent(params.accountId)}/${encodeURIComponent(params.eventId)}`,
        input
      );
      return response.data;
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }

  async deleteEvent(params: DeleteEventParams): Promise<void> {
    try {
      await this.client.delete(
        `/events/${encodeURIComponent(params.accountId)}/${encodeURIComponent(params.eventId)}`
      );
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }

  private handleError(error: AxiosError<ErrorResponse>): ServiceError {
    const serviceError = new Error() as ServiceError;
    
    if (error.response) {
      serviceError.statusCode = error.response.status;
      serviceError.message = error.response.data?.message || error.message;
      serviceError.code = error.response.data?.error;
    } else if (error.request) {
      serviceError.message = `API request failed: ${error.message}`;
      serviceError.statusCode = 500;
    } else {
      serviceError.message = `Request setup failed: ${error.message}`;
      serviceError.statusCode = 500;
    }

    return serviceError;
  }
}