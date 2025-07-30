export interface AppSyncIdentity {
    sub: string;
    issuer: string;
    username?: string;
    claims?: Record<string, unknown>;
    sourceIp?: string[];
    defaultAuthStrategy?: string;
    userArn?: string;
}
export interface AppSyncRequestHeaders {
    [key: string]: string | undefined;
}
export interface AppSyncRequest {
    headers: AppSyncRequestHeaders;
}
export interface AppSyncInfo {
    fieldName: string;
    parentTypeName: string;
    variables?: Record<string, unknown>;
    selectionSetList?: string[];
    selectionSetGraphQL?: string;
}
export interface AppSyncEvent<TArguments = Record<string, unknown>> {
    arguments: TArguments;
    identity?: AppSyncIdentity | null;
    source?: unknown;
    request: AppSyncRequest;
    info: AppSyncInfo;
    prev?: unknown;
    stash?: Record<string, unknown>;
}
export interface GetAccountArguments {
    id: string;
}
export interface ListAccountsArguments {
    cursor?: string;
    limit?: number;
}
export interface CreateAccountArguments {
    input: {
        id?: string;
        name: string;
        status: 'active' | 'suspended' | 'pending';
        billingContactId?: string;
        billingLocationId?: string;
        extendedAttributes?: Array<{
            name: string;
            value: string;
        }>;
    };
}
export interface UpdateAccountArguments {
    id: string;
    input: {
        name?: string;
        status?: 'active' | 'suspended' | 'pending';
        billingContactId?: string | null;
        billingLocationId?: string | null;
        extendedAttributes?: Array<{
            name: string;
            value: string;
        }>;
    };
}
export interface DeleteAccountArguments {
    id: string;
}
export interface DeleteAccountResponse {
    success: boolean;
    id: string;
    message?: string;
}
//# sourceMappingURL=appsync.d.ts.map