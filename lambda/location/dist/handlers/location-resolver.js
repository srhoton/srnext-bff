"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocationResolver = void 0;
const locations_api_service_1 = require("../services/locations-api.service");
class LocationResolver {
    locationsApiService;
    jwtAccountId;
    constructor(event) {
        this.initializeJwtContext(event);
        this.initializeApiService(event);
    }
    initializeJwtContext(event) {
        if (event.identity?.claims?.sub) {
            this.jwtAccountId = event.identity.claims.sub;
            console.log('JWT Account ID extracted:', this.jwtAccountId);
        }
        else {
            console.warn('No JWT claims found in AppSync event');
        }
    }
    initializeApiService(event) {
        const authHeader = event.request?.headers?.authorization || event.request?.headers?.Authorization;
        if (!authHeader) {
            console.error('No authorization header found');
            return;
        }
        const token = authHeader.replace(/^Bearer\s+/i, '');
        this.locationsApiService = new locations_api_service_1.LocationsApiService(token);
        console.log('Locations API service initialized with JWT token');
    }
    async resolve(event) {
        const operation = event.info?.fieldName;
        console.log(`Processing location operation: ${operation}`);
        try {
            switch (operation) {
                case 'getLocation':
                    return this.getLocation(event);
                case 'listLocations':
                    return this.listLocations(event);
                case 'createLocation':
                    return this.createLocation(event);
                case 'updateLocation':
                    return this.updateLocation(event);
                case 'deleteLocation':
                    return this.deleteLocation(event);
                default:
                    throw new Error(`Unknown operation: ${operation}`);
            }
        }
        catch (error) {
            console.error(`Error in ${operation}:`, error);
            throw error;
        }
    }
    validateAccountAccess(requestedAccountId) {
        if (!this.jwtAccountId) {
            throw new Error('Authentication required: JWT token must be provided');
        }
        if (this.jwtAccountId !== requestedAccountId) {
            throw new Error('Access denied: accountId must match authenticated user');
        }
    }
    async getLocation(event) {
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
    async listLocations(event) {
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
    async createLocation(event) {
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
        const location = await this.locationsApiService.createLocation({ accountId }, input);
        return location;
    }
    async updateLocation(event) {
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
        const location = await this.locationsApiService.updateLocation({ accountId, locationId }, input);
        return location;
    }
    async deleteLocation(event) {
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
exports.LocationResolver = LocationResolver;
//# sourceMappingURL=location-resolver.js.map