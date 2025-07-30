export interface AppSyncIdentity {
  sub: string;
  issuer: string;
  username: string;
  claims: Record<string, unknown>;
  sourceIp: string[];
  defaultAuthStrategy: string;
}

export interface AppSyncRequestHeaders {
  [key: string]: string;
}

export interface AppSyncEvent<TArguments = Record<string, unknown>> {
  info: {
    fieldName: string;
    parentTypeName: string;
    variables: Record<string, unknown>;
  };
  arguments: TArguments;
  identity: AppSyncIdentity;
  source: unknown | null;
  request: {
    headers: AppSyncRequestHeaders;
  };
  prev: unknown | null;
}

// Argument types for each operation
export interface GetContactArguments {
  accountId: string;
  email: string;
}

export interface ListContactsArguments {
  accountId: string;
  cursor?: string;
  limit?: number;
}

export interface CreateContactArguments {
  accountId: string;
  input: {
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    status?: 'active' | 'inactive';
    locationIds?: string[];
    config?: Record<string, unknown>;
  };
}

export interface UpdateContactArguments {
  accountId: string;
  email: string;
  input: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    status?: 'active' | 'inactive';
    locationIds?: string[];
    config?: Record<string, unknown>;
  };
}

export interface DeleteContactArguments {
  accountId: string;
  email: string;
}