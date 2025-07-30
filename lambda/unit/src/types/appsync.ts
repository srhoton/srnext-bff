/**
 * AppSync Lambda resolver types
 */

export interface AppSyncIdentity {
  sub: string;
  issuer: string;
  username?: string;
  claims: Record<string, unknown>;
  sourceIp: string[];
  defaultAuthStrategy: string;
  groups?: string[] | null;
}

export interface AppSyncRequestHeaders {
  [key: string]: string | undefined;
  authorization?: string;
}

export interface AppSyncContext {
  arguments: Record<string, unknown>;
  identity: AppSyncIdentity;
  source: Record<string, unknown> | null;
  request: {
    headers: AppSyncRequestHeaders;
  };
  info: {
    fieldName: string;
    parentTypeName: string;
    variables: Record<string, unknown>;
    selectionSetList: string[];
    selectionSetGraphQL: string;
  };
  prev: {
    result: Record<string, unknown> | null;
  };
  stash: Record<string, unknown>;
}

export type AppSyncResolverEvent<TArguments = Record<string, unknown>> = {
  arguments: TArguments;
  identity: AppSyncIdentity;
  source: Record<string, unknown> | null;
  request: {
    headers: AppSyncRequestHeaders;
  };
  info: {
    fieldName: string;
    parentTypeName: string;
    variables: Record<string, unknown>;
    selectionSetList: string[];
    selectionSetGraphQL: string;
  };
  prev: {
    result: Record<string, unknown> | null;
  };
  stash: Record<string, unknown>;
};

/**
 * GraphQL operation arguments
 */
export interface GetUnitArguments {
  id: string;
}

export interface ListUnitsArguments {
  cursor?: string;
  limit?: number;
}

export interface CreateUnitArguments {
  input: {
    locationId: string;
    suggestedVin: string;
    make?: string;
    model?: string;
    modelYear?: string;
    // Add other fields as needed from the Unit type
    [key: string]: unknown;
  };
}

export interface UpdateUnitArguments {
  id: string;
  input: {
    locationId?: string;
    suggestedVin?: string;
    make?: string;
    model?: string;
    modelYear?: string;
    // Add other fields as needed from the Unit type
    [key: string]: unknown;
  };
}

export interface DeleteUnitArguments {
  id: string;
}

/**
 * Error types
 */
export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ValidationError extends Error {
  constructor(message: string, public details?: Record<string, string>) {
    super(message);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

export class ServiceError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = "ServiceError";
  }
}