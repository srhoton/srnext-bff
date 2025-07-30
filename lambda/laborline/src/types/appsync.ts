export interface AppSyncEvent<T = Record<string, unknown>> {
  arguments: T;
  identity?: {
    claims?: {
      sub: string;
      email?: string;
      [key: string]: unknown;
    };
    defaultAuthStrategy?: string;
    groups?: string[] | null;
    issuer?: string;
    sourceIp?: string[];
    sub?: string;
    username?: string;
  };
  source?: Record<string, unknown> | null;
  request?: {
    headers?: Record<string, string>;
    domainName?: string;
  };
  info?: {
    fieldName: string;
    parentTypeName: string;
    variables?: Record<string, unknown>;
    selectionSetList?: string[];
    selectionSetGraphQL?: string;
  };
  prev?: Record<string, unknown> | null;
  stash?: Record<string, unknown>;
}

export interface AppSyncIdentity {
  claims: {
    sub: string;
    email?: string;
    [key: string]: unknown;
  };
  defaultAuthStrategy: string;
  groups: string[] | null;
  issuer: string;
  sourceIp: string[];
  sub: string;
  username: string;
}

export interface AppSyncContext {
  arguments: Record<string, unknown>;
  identity: AppSyncIdentity;
  source: Record<string, unknown> | null;
  request: {
    headers: Record<string, string>;
    domainName: string;
  };
  info: {
    fieldName: string;
    parentTypeName: string;
    variables: Record<string, unknown>;
    selectionSetList: string[];
    selectionSetGraphQL: string;
  };
  prev: Record<string, unknown> | null;
  stash: Record<string, unknown>;
}