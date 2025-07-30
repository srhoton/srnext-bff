"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksApiService = void 0;
const axios_1 = __importDefault(require("axios"));
class TasksApiService {
    client;
    constructor(apiUrl) {
        this.client = axios_1.default.create({
            baseURL: apiUrl,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
    handleApiError(error) {
        if (axios_1.default.isAxiosError(error)) {
            const axiosError = error;
            const errorMessage = axiosError.response?.data?.message ?? axiosError.message;
            const statusCode = axiosError.response?.status ?? 500;
            console.error('API Error:', {
                status: statusCode,
                message: errorMessage,
                data: JSON.stringify(axiosError.response?.data, null, 2),
                url: axiosError.config?.url,
                method: axiosError.config?.method,
                requestData: axiosError.config?.data,
            });
            throw new Error(errorMessage);
        }
        throw error;
    }
    async getTask(accountId, taskId, authToken) {
        try {
            const response = await this.client.get(`/tasks/${accountId}/${taskId}`, {
                headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
            });
            return response.data;
        }
        catch (error) {
            this.handleApiError(error);
        }
    }
    async createTask(accountId, task, authToken) {
        try {
            const response = await this.client.post(`/tasks/${accountId}`, task, {
                headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
            });
            return response.data;
        }
        catch (error) {
            this.handleApiError(error);
        }
    }
    async updateTask(accountId, taskId, updates, authToken) {
        try {
            const response = await this.client.put(`/tasks/${accountId}/${taskId}`, updates, {
                headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
            });
            return response.data;
        }
        catch (error) {
            this.handleApiError(error);
        }
    }
    async deleteTask(accountId, taskId, authToken) {
        try {
            await this.client.delete(`/tasks/${accountId}/${taskId}`, {
                headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
            });
            return true;
        }
        catch (error) {
            this.handleApiError(error);
        }
    }
    async listTasks(accountId, options = {}, authToken) {
        try {
            const params = new URLSearchParams();
            if (options.limit !== undefined) {
                params.append('limit', options.limit.toString());
            }
            if (options.cursor !== undefined) {
                params.append('cursor', options.cursor);
            }
            const response = await this.client.get(`/tasks/${accountId}`, {
                params,
                headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
            });
            return response.data;
        }
        catch (error) {
            this.handleApiError(error);
        }
    }
}
exports.TasksApiService = TasksApiService;
//# sourceMappingURL=tasks-api.js.map