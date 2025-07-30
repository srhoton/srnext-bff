"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LaborLineResolver = void 0;
const uuid_1 = require("uuid");
const laborlines_api_service_1 = require("../services/laborlines-api.service");
class LaborLineResolver {
    jwtAccountId = null;
    laborLinesApiService = null;
    constructor(authToken) {
        if (authToken) {
            this.laborLinesApiService = new laborlines_api_service_1.LaborLinesApiService(authToken);
        }
    }
    extractJwtAccountId(event) {
        const sub = event.identity?.claims?.sub;
        if (!sub) {
            throw new Error('Authentication required: JWT token must be provided');
        }
        return sub;
    }
    validateAccountAccess(requestedAccountId) {
        if (!this.jwtAccountId) {
            throw new Error('Authentication required: JWT token must be provided');
        }
        if (this.jwtAccountId !== requestedAccountId) {
            throw new Error('Access denied: accountId must match authenticated user');
        }
    }
    ensureApiService() {
        if (!this.laborLinesApiService) {
            throw new Error('API service not initialized - authentication required');
        }
        return this.laborLinesApiService;
    }
    async handleRequest(event) {
        console.log('Received AppSync event:', JSON.stringify(event, null, 2));
        try {
            // Extract JWT account ID from the event
            this.jwtAccountId = this.extractJwtAccountId(event);
            console.log('Authenticated user (JWT sub):', this.jwtAccountId);
            const fieldName = event.info?.fieldName;
            switch (fieldName) {
                case 'getLaborLine':
                    return await this.getLaborLine(event);
                case 'listLaborLines':
                    return await this.listLaborLines(event);
                case 'createLaborLine':
                    return await this.createLaborLine(event);
                case 'updateLaborLine':
                    return await this.updateLaborLine(event);
                case 'deleteLaborLine':
                    return await this.deleteLaborLine(event);
                default:
                    throw new Error(`Unknown field: ${fieldName}`);
            }
        }
        catch (error) {
            console.error('Error handling request:', error);
            throw error;
        }
    }
    async getLaborLine(event) {
        const { accountId, laborLineId } = event.arguments;
        // Validate that the requested accountId matches the JWT sub claim
        this.validateAccountAccess(accountId);
        console.log(`Getting labor line: ${laborLineId} for account: ${accountId}`);
        const apiService = this.ensureApiService();
        const laborLine = await apiService.getLaborLine({ accountId, laborLineId });
        console.log('Labor line retrieved successfully');
        return laborLine;
    }
    async listLaborLines(event) {
        const { accountId, taskId, cursor, limit } = event.arguments;
        // Validate that the requested accountId matches the JWT sub claim
        this.validateAccountAccess(accountId);
        console.log(`Listing labor lines for account: ${accountId}, taskId: ${taskId || 'all'}`);
        const apiService = this.ensureApiService();
        const result = await apiService.listLaborLines({
            accountId,
            taskId,
            cursor,
            limit,
        });
        console.log(`Retrieved ${result.items.length} labor lines`);
        return result;
    }
    async createLaborLine(event) {
        const { accountId, input } = event.arguments;
        // Validate that the requested accountId matches the JWT sub claim
        this.validateAccountAccess(accountId);
        console.log(`Creating labor line for account: ${accountId}`);
        // Generate laborLineId if not provided
        const createInput = {
            ...input,
            laborLineId: input.laborLineId || (0, uuid_1.v4)(),
        };
        console.log('Create labor line input:', JSON.stringify(createInput, null, 2));
        const apiService = this.ensureApiService();
        const laborLine = await apiService.createLaborLine({ accountId }, createInput);
        console.log('Labor line created successfully');
        return laborLine;
    }
    async updateLaborLine(event) {
        const { accountId, laborLineId, input } = event.arguments;
        // Validate that the requested accountId matches the JWT sub claim
        this.validateAccountAccess(accountId);
        console.log(`Updating labor line: ${laborLineId} for account: ${accountId}`);
        console.log('Update labor line input:', JSON.stringify(input, null, 2));
        const apiService = this.ensureApiService();
        const laborLine = await apiService.updateLaborLine({ accountId, laborLineId }, input);
        console.log('Labor line updated successfully');
        return laborLine;
    }
    async deleteLaborLine(event) {
        const { accountId, laborLineId } = event.arguments;
        // Validate that the requested accountId matches the JWT sub claim
        this.validateAccountAccess(accountId);
        console.log(`Deleting labor line: ${laborLineId} for account: ${accountId}`);
        const apiService = this.ensureApiService();
        await apiService.deleteLaborLine({ accountId, laborLineId });
        console.log('Labor line deleted successfully');
        return {
            success: true,
            accountId,
            laborLineId,
            message: 'Labor line deleted successfully',
        };
    }
}
exports.LaborLineResolver = LaborLineResolver;
//# sourceMappingURL=laborline-resolver.js.map