"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountResolver = void 0;
const accounts_api_service_1 = require("../services/accounts-api.service");
class AccountResolver {
    accountsApiService;
    accountId;
    constructor(authToken, accountId) {
        this.accountsApiService = new accounts_api_service_1.AccountsApiService(authToken);
        this.accountId = accountId;
    }
    async handleRequest(event) {
        const { fieldName } = event.info;
        console.log(`Handling ${fieldName} request`, {
            arguments: event.arguments,
            identity: event.identity,
        });
        switch (fieldName) {
            case 'getAccount':
                return this.getAccount(event);
            case 'listAccounts':
                return this.listAccounts(event);
            case 'createAccount':
                return this.createAccount(event);
            case 'updateAccount':
                return this.updateAccount(event);
            case 'deleteAccount':
                return this.deleteAccount(event);
            default:
                throw new Error(`Unknown field: ${fieldName}`);
        }
    }
    async getAccount(event) {
        const { id } = event.arguments;
        // Verify that the requested account ID matches the JWT sub claim
        if (id !== this.accountId) {
            throw new Error('Unauthorized: You can only access your own account');
        }
        const account = await this.accountsApiService.getAccount(id);
        return this.convertTimestamps(account);
    }
    async listAccounts(_event) {
        // For list operation, we only return the account matching the JWT sub
        // This is different from the API which might return all accounts
        if (!this.accountId) {
            throw new Error('Unauthorized: No account ID found in JWT');
        }
        try {
            const account = await this.accountsApiService.getAccount(this.accountId);
            return {
                items: [this.convertTimestamps(account)],
                hasMore: false,
            };
        }
        catch (error) {
            // If account not found, return empty list
            if (error instanceof Error && error.message.includes('not found')) {
                return {
                    items: [],
                    hasMore: false,
                };
            }
            throw error;
        }
    }
    async createAccount(event) {
        const { input } = event.arguments;
        // If no ID is provided, use the account ID from JWT
        const accountId = input.id || this.accountId;
        // Ensure required fields are present
        if (!accountId) {
            throw new Error('Account ID is required');
        }
        const accountData = {
            ...input,
            id: accountId,
        };
        const account = await this.accountsApiService.createAccount(accountData);
        return this.convertTimestamps(account);
    }
    async updateAccount(event) {
        const { id, input } = event.arguments;
        // Verify that the account being updated matches the JWT sub claim
        if (id !== this.accountId) {
            throw new Error('Unauthorized: You can only update your own account');
        }
        const account = await this.accountsApiService.updateAccount(id, input);
        return this.convertTimestamps(account);
    }
    async deleteAccount(event) {
        const { id } = event.arguments;
        // For delete operation, we need to verify ownership
        // Based on requirements, this should match the JWT sub
        if (id !== this.accountId) {
            throw new Error('Unauthorized: You can only delete your own account');
        }
        await this.accountsApiService.deleteAccount(id);
        return {
            success: true,
            id,
            message: 'Account deleted successfully',
        };
    }
    convertTimestamps(account) {
        return {
            ...account,
            createdAt: Math.floor(new Date(account.createdAt).getTime() / 1000),
            updatedAt: Math.floor(new Date(account.updatedAt).getTime() / 1000),
        };
    }
}
exports.AccountResolver = AccountResolver;
//# sourceMappingURL=account-resolver.js.map