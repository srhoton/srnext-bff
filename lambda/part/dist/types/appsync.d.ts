import { GraphQLPartInput, GraphQLPartUpdateInput } from './part';
export interface AppSyncIdentity {
    claims: {
        sub: string;
        [key: string]: unknown;
    };
}
export interface AppSyncRequestHeaders {
    authorization?: string;
    [key: string]: string | undefined;
}
export interface AppSyncRequest {
    headers: AppSyncRequestHeaders;
}
export interface AppSyncInfo {
    fieldName: string;
    parentTypeName: string;
    selectionSetList: string[];
    selectionSetGraphQL: string;
    variables: Record<string, unknown>;
}
export interface AppSyncEvent<TArguments = Record<string, unknown>> {
    arguments: TArguments;
    identity: AppSyncIdentity | null;
    request: AppSyncRequest;
    info: AppSyncInfo;
    source: unknown | null;
}
export interface GetPartArguments {
    accountId: string;
    partId: string;
}
export interface CreatePartArguments {
    accountId: string;
    input: GraphQLPartInput;
}
export interface UpdatePartArguments {
    accountId: string;
    partId: string;
    input: GraphQLPartUpdateInput;
}
export interface DeletePartArguments {
    accountId: string;
    partId: string;
}
export interface ListPartsArguments {
    accountId: string;
    locationId?: string;
    unitId?: string;
    limit?: number;
    cursor?: string;
}
//# sourceMappingURL=appsync.d.ts.map