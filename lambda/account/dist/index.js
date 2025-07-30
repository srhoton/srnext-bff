"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const account_resolver_1 = require("./handlers/account-resolver");
const handler = async (event) => {
    console.log('Received event:', JSON.stringify(event, null, 2));
    try {
        // Extract JWT token from the authorization header
        const authHeader = event.request?.headers?.['authorization'] || event.request?.headers?.['Authorization'];
        if (!authHeader) {
            throw new Error('No authorization header found');
        }
        // Remove 'Bearer ' prefix if present
        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
        // Extract account ID from the JWT sub claim
        const accountId = event.identity?.sub;
        if (!accountId) {
            console.warn('No account ID found in JWT sub claim');
        }
        // Create resolver instance and handle the request
        const resolver = new account_resolver_1.AccountResolver(token, accountId);
        const result = await resolver.handleRequest(event);
        console.log('Returning result:', JSON.stringify(result, null, 2));
        return result;
    }
    catch (error) {
        console.error('Error processing request:', error);
        // Format error for AppSync
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        throw new Error(errorMessage);
    }
};
exports.handler = handler;
//# sourceMappingURL=index.js.map