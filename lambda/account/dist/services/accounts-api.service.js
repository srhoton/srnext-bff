"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountsApiService = void 0;
const axios_1 = __importDefault(require("axios"));
class AccountsApiService {
    client;
    baseUrl;
    constructor(authToken) {
        this.baseUrl = process.env['ACCOUNTS_API_URL'] || 'https://account-srnext.sb.fullbay.com';
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
    async getAccount(accountId) {
        try {
            const response = await this.client.get(`/accounts/${accountId}`);
            return response.data;
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error) && error.response?.status === 404) {
                throw new Error(`Account with ID ${accountId} not found`);
            }
            throw this.handleError(error);
        }
    }
    async listAccounts(cursor, limit) {
        try {
            const params = {};
            if (cursor)
                params['cursor'] = cursor;
            if (limit)
                params['limit'] = limit;
            const response = await this.client.get('/accounts', { params });
            return response.data;
        }
        catch (error) {
            throw this.handleError(error);
        }
    }
    async createAccount(account) {
        try {
            const response = await this.client.post('/accounts', account);
            return response.data;
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error) && error.response?.status === 400) {
                const validationError = error.response.data;
                if (validationError.validationErrors) {
                    const errors = validationError.validationErrors
                        .map((err) => `${err.field}: ${err.message}`)
                        .join(', ');
                    throw new Error(`Validation failed: ${errors}`);
                }
            }
            throw this.handleError(error);
        }
    }
    async updateAccount(accountId, updates) {
        try {
            const response = await this.client.put(`/accounts/${accountId}`, updates);
            return response.data;
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                if (error.response?.status === 404) {
                    throw new Error(`Account with ID ${accountId} not found`);
                }
                if (error.response?.status === 400) {
                    const validationError = error.response.data;
                    if (validationError.validationErrors) {
                        const errors = validationError.validationErrors
                            .map((err) => `${err.field}: ${err.message}`)
                            .join(', ');
                        throw new Error(`Validation failed: ${errors}`);
                    }
                }
            }
            throw this.handleError(error);
        }
    }
    async deleteAccount(accountId) {
        try {
            await this.client.delete(`/accounts/${accountId}`);
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error) && error.response?.status === 404) {
                throw new Error(`Account with ID ${accountId} not found`);
            }
            throw this.handleError(error);
        }
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
exports.AccountsApiService = AccountsApiService;
//# sourceMappingURL=accounts-api.service.js.map