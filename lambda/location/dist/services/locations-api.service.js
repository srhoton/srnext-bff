"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocationsApiService = void 0;
const axios_1 = __importDefault(require("axios"));
class LocationsApiService {
    httpClient;
    baseUrl;
    constructor(authToken) {
        this.baseUrl = process.env.LOCATIONS_API_URL || 'https://location-srnext.sb.fullbay.com';
        this.httpClient = axios_1.default.create({
            baseURL: this.baseUrl,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            },
        });
        this.httpClient.interceptors.response.use((response) => response, (error) => {
            console.error('Response error:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message,
            });
            return Promise.reject(this.handleError(error));
        });
    }
    async getLocation(params) {
        try {
            console.log(`Getting location: ${params.locationId} for account: ${params.accountId}`);
            const response = await this.httpClient.get(`/locations/${params.locationId}`);
            // Validate that the returned location belongs to the correct account
            if (response.data.accountId !== params.accountId) {
                throw new Error(`Location ${params.locationId} does not belong to account ${params.accountId}`);
            }
            console.log('Location retrieved successfully');
            return response.data;
        }
        catch (error) {
            console.error('Error getting location:', error);
            throw error;
        }
    }
    async listLocations(params) {
        try {
            console.log(`Listing locations for account: ${params.accountId}`);
            const queryParams = new URLSearchParams();
            queryParams.append('accountId', params.accountId);
            if (params.cursor)
                queryParams.append('cursor', params.cursor);
            if (params.limit)
                queryParams.append('limit', params.limit.toString());
            const url = `/locations?${queryParams.toString()}`;
            const response = await this.httpClient.get(url);
            console.log(`Retrieved ${response.data.items.length} locations`);
            return response.data;
        }
        catch (error) {
            console.error('Error listing locations:', error);
            throw error;
        }
    }
    async createLocation(params, input) {
        try {
            console.log(`Creating location for account: ${params.accountId}`);
            console.log('Create location input:', JSON.stringify(input, null, 2));
            // Validate that input accountId matches params accountId
            if (input.accountId !== params.accountId) {
                throw new Error('Input accountId must match params accountId');
            }
            const response = await this.httpClient.post('/locations', input);
            console.log('Location created successfully');
            return response.data;
        }
        catch (error) {
            console.error('Error creating location:', error);
            throw error;
        }
    }
    async updateLocation(params, input) {
        try {
            console.log(`Updating location: ${params.locationId} for account: ${params.accountId}`);
            console.log('Update location input:', JSON.stringify(input, null, 2));
            // If accountId is provided in input, validate it matches params
            if (input.accountId && input.accountId !== params.accountId) {
                throw new Error('Input accountId must match params accountId');
            }
            const response = await this.httpClient.put(`/locations/${params.locationId}`, input);
            // Validate that the returned location belongs to the correct account
            if (response.data.accountId !== params.accountId) {
                throw new Error(`Location ${params.locationId} does not belong to account ${params.accountId}`);
            }
            console.log('Location updated successfully');
            return response.data;
        }
        catch (error) {
            console.error('Error updating location:', error);
            throw error;
        }
    }
    async deleteLocation(params) {
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
        }
        catch (error) {
            console.error('Error deleting location:', error);
            throw error;
        }
    }
    handleError(error) {
        if (error.response) {
            const status = error.response.status;
            const data = error.response.data;
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
exports.LocationsApiService = LocationsApiService;
//# sourceMappingURL=locations-api.service.js.map