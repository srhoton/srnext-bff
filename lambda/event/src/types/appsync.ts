export interface AppSyncIdentityClaims {
  sub: string;
  email_verified: boolean;
  iss: string;
  'cognito:username': string;
  given_name: string;
  origin_jti: string;
  aud: string;
  event_id: string;
  token_use: string;
  auth_time: number;
  exp: number;
  iat: number;
  family_name: string;
  jti: string;
  email: string;
}

export interface AppSyncIdentity {
  claims: AppSyncIdentityClaims;
  defaultAuthStrategy: string;
  groups: string[] | null;
  issuer: string;
  sourceIp: string[];
  sub: string;
  username: string;
}

export interface AppSyncRequestHeaders {
  authorization: string;
  [key: string]: string;
}

export interface AppSyncRequest {
  headers: AppSyncRequestHeaders;
  domainName: string;
}

export interface AppSyncInfo {
  fieldName: string;
  parentTypeName: string;
  variables: Record<string, unknown>;
  selectionSetList: string[];
  selectionSetGraphQL: string;
}

export interface AppSyncEvent<TArguments = Record<string, unknown>> {
  arguments: TArguments;
  identity: AppSyncIdentity;
  source: unknown;
  request: AppSyncRequest;
  info: AppSyncInfo;
  prev: unknown;
  stash: Record<string, unknown>;
}

export interface ServiceError extends Error {
  statusCode?: number;
  code?: string;
}