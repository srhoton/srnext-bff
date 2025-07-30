import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import {
  Location,
  CreateLocationInput,
  UpdateLocationInput,
  LocationPageResponse,
  GetLocationParams,
  ListLocationsParams,
  CreateLocationParams,
  UpdateLocationParams,
  DeleteLocationParams,
} from '../types';

export class LocationsApiService {
  private readonly httpClient: AxiosInstance;
  private readonly baseUrl: string;

  constructor(authToken: string) {
    this.baseUrl = process.env.LOCATIONS_API_URL || 'https://location-srnext.sb.fullbay.com';
    
    this.httpClient = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
    });

    this.httpClient.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError) => {
        console.error('Response error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
        return Promise.reject(this.handleError(error));
      }
    );
  }

  async getLocation(params: GetLocationParams): Promise<Location> {
    try {
      console.log(`Getting location: ${params.locationId} for account: ${params.accountId}`);
      
      const response = await this.httpClient.get<Location>(
        `/locations/${params.locationId}`
      );
      
      // Validate that the returned location belongs to the correct account
      if (response.data.accountId !== params.accountId) {
        throw new Error(`Location ${params.locationId} does not belong to account ${params.accountId}`);
      }
      
      console.log('Location retrieved successfully');
      return response.data;
    } catch (error) {
      console.error('Error getting location:', error);
      throw error;
    }
  }

  async listLocations(params: ListLocationsParams): Promise<LocationPageResponse> {
    try {
      console.log(`Listing locations for account: ${params.accountId}`);
      
      const queryParams = new URLSearchParams();
      queryParams.append('accountId', params.accountId);
      if (params.cursor) queryParams.append('cursor', params.cursor);
      if (params.limit) queryParams.append('limit', params.limit.toString());

      const url = `/locations?${queryParams.toString()}`;
      
      const response = await this.httpClient.get<LocationPageResponse>(url);
      
      console.log(`Retrieved ${response.data.items.length} locations`);
      return response.data;
    } catch (error) {
      console.error('Error listing locations:', error);
      throw error;
    }
  }

  async createLocation(params: CreateLocationParams, input: CreateLocationInput): Promise<Location> {
    try {
      console.log(`Creating location for account: ${params.accountId}`);
      console.log('Create location input:', JSON.stringify(input, null, 2));
      
      // Validate that input accountId matches params accountId
      if (input.accountId !== params.accountId) {
        throw new Error('Input accountId must match params accountId');
      }
      
      const response = await this.httpClient.post<Location>('/locations', input);
      
      console.log('Location created successfully');
      return response.data;
    } catch (error) {
      console.error('Error creating location:', error);
      throw error;
    }
  }

  async updateLocation(params: UpdateLocationParams, input: UpdateLocationInput): Promise<Location> {
    try {
      console.log(`Updating location: ${params.locationId} for account: ${params.accountId}`);
      console.log('Update location input:', JSON.stringify(input, null, 2));
      
      // If accountId is provided in input, validate it matches params
      if (input.accountId && input.accountId !== params.accountId) {
        throw new Error('Input accountId must match params accountId');
      }
      
      const response = await this.httpClient.put<Location>(
        `/locations/${params.locationId}`,
        input
      );
      
      // Validate that the returned location belongs to the correct account
      if (response.data.accountId !== params.accountId) {
        throw new Error(`Location ${params.locationId} does not belong to account ${params.accountId}`);
      }
      
      console.log('Location updated successfully');
      return response.data;
    } catch (error) {
      console.error('Error updating location:', error);
      throw error;
    }
  }

  async deleteLocation(params: DeleteLocationParams): Promise<void> {
    try {
      console.log(`Deleting location: ${params.locationId} for account: ${params.accountId}`);
      
      // First get the location to validate ownership
      const location = await this.getLocation({
        accountId: params.accountId,
        locationId: params.locationId,
      });
      
      if (location.accountId !== params.accountId) {
        throw new Error(`Location ${params.locationId} does not belong to account ${params.accountId}`);
      }
      
      await this.httpClient.delete(`/locations/${params.locationId}`);
      
      console.log('Location deleted successfully');
    } catch (error) {
      console.error('Error deleting location:', error);
      throw error;
    }
  }

  private handleError(error: AxiosError): Error {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as any;
      
      switch (status) {
        case 400:
          return new Error(data?.message || 'Bad request');
        case 404:
          return new Error(data?.message || 'Location not found');
        case 500:
          return new Error(data?.message || 'Internal server error');
        default:
          return new Error(data?.message || `HTTP ${status}: ${error.message}`);
      }
    }
    
    if (error.request) {
      return new Error('Network error: Unable to reach locations service');
    }
    
    return new Error(`Request setup error: ${error.message}`);
  }
}