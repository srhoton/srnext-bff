"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LaborLinesApiService = void 0;
const axios_1 = __importDefault(require("axios"));
class LaborLinesApiService {
    httpClient;
    baseUrl;
    constructor(authToken) {
        this.baseUrl = process.env.LABORLINES_API_URL || 'https://laborlines-dev.sb.fullbay.com';
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
    async getLaborLine(params) {
        try {
            console.log(`Getting labor line: ${params.laborLineId} for account: ${params.accountId}`);
            const response = await this.httpClient.get(`/labor-lines/${params.accountId}/${params.laborLineId}`);
            console.log('Labor line retrieved successfully');
            return response.data;
        }
        catch (error) {
            console.error('Error getting labor line:', error);
            throw error;
        }
    }
    async listLaborLines(params) {
        try {
            console.log(`Listing labor lines for account: ${params.accountId}`);
            const queryParams = new URLSearchParams();
            if (params.taskId)
                queryParams.append('taskId', params.taskId);
            if (params.cursor)
                queryParams.append('cursor', params.cursor);
            if (params.limit)
                queryParams.append('limit', params.limit.toString());
            const url = `/labor-lines/${params.accountId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
            const response = await this.httpClient.get(url);
            console.log(`Retrieved ${response.data.items.length} labor lines`);
            return response.data;
        }
        catch (error) {
            console.error('Error listing labor lines:', error);
            throw error;
        }
    }
    async createLaborLine(params, input) {
        try {
            console.log(`Creating labor line for account: ${params.accountId}`);
            console.log('Create labor line input:', JSON.stringify(input, null, 2));
            const response = await this.httpClient.post(`/labor-lines/${params.accountId}`, input);
            console.log('Labor line created successfully');
            return response.data;
        }
        catch (error) {
            console.error('Error creating labor line:', error);
            throw error;
        }
    }
    async updateLaborLine(params, input) {
        try {
            console.log(`Updating labor line: ${params.laborLineId} for account: ${params.accountId}`);
            console.log('Update labor line input:', JSON.stringify(input, null, 2));
            const response = await this.httpClient.put(`/labor-lines/${params.accountId}/${params.laborLineId}`, input);
            console.log('Labor line updated successfully');
            return response.data;
        }
        catch (error) {
            console.error('Error updating labor line:', error);
            throw error;
        }
    }
    async deleteLaborLine(params) {
        try {
            console.log(`Deleting labor line: ${params.laborLineId} for account: ${params.accountId}`);
            await this.httpClient.delete(`/labor-lines/${params.accountId}/${params.laborLineId}`);
            console.log('Labor line deleted successfully');
        }
        catch (error) {
            console.error('Error deleting labor line:', error);
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
                    return new Error(data?.message || 'Labor line not found');
                case 500:
                    return new Error(data?.message || 'Internal server error');
                default:
                    return new Error(data?.message || `HTTP ${status}: ${error.message}`);
            }
        }
        if (error.request) {
            return new Error('Network error: Unable to reach laborlines service');
        }
        return new Error(`Request setup error: ${error.message}`);
    }
}
exports.LaborLinesApiService = LaborLinesApiService;
//# sourceMappingURL=laborlines-api.service.js.map