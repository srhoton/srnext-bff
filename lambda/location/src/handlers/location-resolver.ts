import { LocationsApiService } from '../services/locations-api.service';
import {
  AppSyncEvent,
  Location,
  CreateLocationInput,
  UpdateLocationInput,
  LocationPageResponse,
} from '../types';

interface GetLocationArguments {
  accountId: string;
  locationId: string;
}

interface ListLocationsArguments {
  accountId: string;
  cursor?: string;
  limit?: number;
}

interface CreateLocationArguments {
  accountId: string;
  input: CreateLocationInput;
}

interface UpdateLocationArguments {
  accountId: string;
  locationId: string;
  input: UpdateLocationInput;
}

interface DeleteLocationArguments {
  accountId: string;
  locationId: string;
}

export class LocationResolver {
  private locationsApiService: LocationsApiService | undefined;
  private jwtAccountId: string | undefined;

  constructor(event: AppSyncEvent) {
    this.initializeJwtContext(event);
    this.initializeApiService(event);
  }

  private initializeJwtContext(event: AppSyncEvent): void {
    if (event.identity?.claims?.sub) {
      this.jwtAccountId = event.identity.claims.sub;
      console.log('JWT Account ID extracted:', this.jwtAccountId);
    } else {
      console.warn('No JWT claims found in AppSync event');
    }
  }

  private initializeApiService(event: AppSyncEvent): void {
    const authHeader = event.request?.headers?.authorization || event.request?.headers?.Authorization;
    
    if (!authHeader) {
      console.error('No authorization header found');
      return;
    }

    const token = authHeader.replace(/^Bearer\s+/i, '');
    this.locationsApiService = new LocationsApiService(token);
    console.log('Locations API service initialized with JWT token');
  }

  async resolve(event: AppSyncEvent): Promise<unknown> {
    const operation = event.info?.fieldName;
    console.log(`Processing location operation: ${operation}`);

    try {
      switch (operation) {
        case 'getLocation':
          return this.getLocation(event as unknown as AppSyncEvent<GetLocationArguments>);
        case 'listLocations':
          return this.listLocations(event as unknown as AppSyncEvent<ListLocationsArguments>);
        case 'createLocation':
          return this.createLocation(event as unknown as AppSyncEvent<CreateLocationArguments>);
        case 'updateLocation':
          return this.updateLocation(event as unknown as AppSyncEvent<UpdateLocationArguments>);
        case 'deleteLocation':
          return this.deleteLocation(event as unknown as AppSyncEvent<DeleteLocationArguments>);
        default:
          throw new Error(`Unknown operation: ${operation}`);
      }
    } catch (error) {
      console.error(`Error in ${operation}:`, error);
      throw error;
    }
  }

  private validateAccountAccess(requestedAccountId: string): void {
    if (!this.jwtAccountId) {
      throw new Error('Authentication required: JWT token must be provided');
    }
    
    if (this.jwtAccountId !== requestedAccountId) {
      throw new Error('Access denied: accountId must match authenticated user');
    }
  }

  private async getLocation(event: AppSyncEvent<GetLocationArguments>): Promise<Location> {
    const { accountId, locationId } = event.arguments;
    
    // Validate JWT and account access
    this.validateAccountAccess(accountId);
    
    if (!this.locationsApiService) {
      throw new Error('Locations API service not initialized');
    }

    console.log(`Getting location: ${locationId} for account: ${accountId}`);
    
    const location = await this.locationsApiService.getLocation({
      accountId,
      locationId,
    });

    return location;
  }

  private async listLocations(event: AppSyncEvent<ListLocationsArguments>): Promise<LocationPageResponse> {
    const { accountId, cursor, limit } = event.arguments;
    
    // Validate JWT and account access
    this.validateAccountAccess(accountId);
    
    if (!this.locationsApiService) {
      throw new Error('Locations API service not initialized');
    }

    console.log(`Listing locations for account: ${accountId}`);
    
    const response = await this.locationsApiService.listLocations({
      accountId,
      cursor,
      limit,
    });

    return response;
  }

  private async createLocation(event: AppSyncEvent<CreateLocationArguments>): Promise<Location> {
    const { accountId, input } = event.arguments;
    
    // Validate JWT and account access
    this.validateAccountAccess(accountId);
    
    if (!this.locationsApiService) {
      throw new Error('Locations API service not initialized');
    }

    // Ensure input accountId matches the request accountId
    if (input.accountId !== accountId) {
      throw new Error('Input accountId must match request accountId');
    }

    console.log(`Creating location for account: ${accountId}`);
    console.log('Create location input:', JSON.stringify(input, null, 2));
    
    const location = await this.locationsApiService.createLocation(
      { accountId },
      input
    );

    return location;
  }

  private async updateLocation(event: AppSyncEvent<UpdateLocationArguments>): Promise<Location> {
    const { accountId, locationId, input } = event.arguments;
    
    // Validate JWT and account access
    this.validateAccountAccess(accountId);
    
    if (!this.locationsApiService) {
      throw new Error('Locations API service not initialized');
    }

    // If accountId is provided in input, ensure it matches the request accountId
    if (input.accountId && input.accountId !== accountId) {
      throw new Error('Input accountId must match request accountId');
    }

    console.log(`Updating location: ${locationId} for account: ${accountId}`);
    console.log('Update location input:', JSON.stringify(input, null, 2));
    
    const location = await this.locationsApiService.updateLocation(
      { accountId, locationId },
      input
    );

    return location;
  }

  private async deleteLocation(event: AppSyncEvent<DeleteLocationArguments>): Promise<boolean> {
    const { accountId, locationId } = event.arguments;
    
    // Validate JWT and account access
    this.validateAccountAccess(accountId);
    
    if (!this.locationsApiService) {
      throw new Error('Locations API service not initialized');
    }

    console.log(`Deleting location: ${locationId} for account: ${accountId}`);
    
    await this.locationsApiService.deleteLocation({
      accountId,
      locationId,
    });

    return true;
  }
}