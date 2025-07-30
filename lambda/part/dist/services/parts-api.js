"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartsApiService = void 0;
const axios_1 = __importDefault(require("axios"));
class PartsApiService {
    constructor(baseUrl) {
        this.apiClient = axios_1.default.create({
            baseURL: baseUrl,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
    handleApiError(error) {
        if (axios_1.default.isAxiosError(error)) {
            const axiosError = error;
            const errorData = axiosError.response?.data;
            const message = errorData?.error?.message ?? axiosError.message;
            console.error('API Error:', {
                status: axiosError.response?.status,
                message,
                data: axiosError.response?.data,
            });
            throw new Error(message);
        }
        throw error;
    }
    async listParts(accountId, options = {}, jwtToken) {
        try {
            const params = new URLSearchParams();
            if (options.locationId) {
                params.append('locationId', options.locationId);
            }
            if (options.unitId) {
                params.append('unitId', options.unitId);
            }
            if (options.limit) {
                params.append('limit', options.limit.toString());
            }
            if (options.cursor) {
                params.append('cursor', options.cursor);
            }
            const headers = {};
            if (jwtToken) {
                headers['Authorization'] = `Bearer ${jwtToken}`;
            }
            const response = await this.apiClient.get(`/parts/${accountId}`, {
                params,
                headers,
            });
            return response.data;
        }
        catch (error) {
            this.handleApiError(error);
        }
    }
    async getPart(accountId, sortKey, jwtToken) {
        try {
            const headers = {};
            if (jwtToken) {
                headers['Authorization'] = `Bearer ${jwtToken}`;
            }
            const response = await this.apiClient.get(`/parts/${accountId}/${encodeURIComponent(sortKey)}`, { headers });
            if (!response.data.success || !response.data.data) {
                throw new Error('Invalid response from parts API');
            }
            return response.data.data;
        }
        catch (error) {
            this.handleApiError(error);
        }
    }
    async createPart(accountId, input, jwtToken) {
        try {
            const headers = {};
            if (jwtToken) {
                headers['Authorization'] = `Bearer ${jwtToken}`;
            }
            const response = await this.apiClient.post(`/parts/${accountId}`, input, { headers });
            if (!response.data.success || !response.data.data) {
                throw new Error('Invalid response from parts API');
            }
            return response.data.data;
        }
        catch (error) {
            this.handleApiError(error);
        }
    }
    async updatePart(accountId, sortKey, input, jwtToken) {
        try {
            const headers = {};
            if (jwtToken) {
                headers['Authorization'] = `Bearer ${jwtToken}`;
            }
            const response = await this.apiClient.put(`/parts/${accountId}/${encodeURIComponent(sortKey)}`, input, { headers });
            if (!response.data.success || !response.data.data) {
                throw new Error('Invalid response from parts API');
            }
            return response.data.data;
        }
        catch (error) {
            this.handleApiError(error);
        }
    }
    async deletePart(accountId, sortKey, jwtToken) {
        try {
            const headers = {};
            if (jwtToken) {
                headers['Authorization'] = `Bearer ${jwtToken}`;
            }
            const response = await this.apiClient.delete(`/parts/${accountId}/${encodeURIComponent(sortKey)}`, { headers });
            return response.data.success === true;
        }
        catch (error) {
            this.handleApiError(error);
        }
    }
}
exports.PartsApiService = PartsApiService;
//# sourceMappingURL=parts-api.js.map