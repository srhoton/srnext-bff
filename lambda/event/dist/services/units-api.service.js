"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnitsApiService = void 0;
const axios_1 = __importDefault(require("axios"));
class UnitsApiService {
    client;
    baseUrl;
    constructor(authToken) {
        this.baseUrl = process.env['UNITS_API_URL'] || 'https://unit-srnext.sb.fullbay.com';
        this.client = axios_1.default.create({
            baseURL: this.baseUrl,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            timeout: 30000, // 30 seconds
        });
        // Add request interceptor for logging
        this.client.interceptors.request.use((config) => {
            console.log(`Making request to ${config.method?.toUpperCase()} ${config.url}`);
            return config;
        }, (error) => {
            console.error('Request error:', error);
            return Promise.reject(error);
        });
        // Add response interceptor for error handling
        this.client.interceptors.response.use((response) => response, (error) => {
            console.error('Response error:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message,
            });
            return Promise.reject(error);
        });
    }
    async listUnits(accountId, cursor, limit) {
        try {
            const params = {};
            if (cursor)
                params['cursor'] = cursor;
            if (limit)
                params['limit'] = limit;
            const response = await this.client.get(`/units/${encodeURIComponent(accountId)}`, { params });
            return response.data;
        }
        catch (error) {
            throw this.handleError(error);
        }
    }
    async getAllUnits(accountId) {
        const allUnits = [];
        let cursor;
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
    handleError(error) {
        if (axios_1.default.isAxiosError(error)) {
            const response = error.response;
            if (response?.data) {
                const errorData = response.data;
                return new Error(`${errorData.error}: ${errorData.message}`);
            }
            return new Error(`API request failed: ${error.message}`);
        }
        return error instanceof Error ? error : new Error('Unknown error occurred');
    }
}
exports.UnitsApiService = UnitsApiService;
//# sourceMappingURL=units-api.service.js.map