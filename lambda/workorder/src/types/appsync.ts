export interface AppSyncIdentity {
  claims?: {
    sub?: string;
    email?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface AppSyncRequestHeaders {
  authorization?: string;
  [key: string]: string | undefined;
}

export interface AppSyncEvent<TArguments = Record<string, unknown>> {
  arguments: TArguments;
  identity: AppSyncIdentity;
  source: unknown;
  request: {
    headers: AppSyncRequestHeaders;
  };
  info: {
    parentTypeName: string;
    fieldName: string;
    variables: Record<string, unknown>;
    selectionSetList: string[];
    selectionSetGraphQL: string;
  };
  prev: unknown;
  stash: Record<string, unknown>;
}

import { GraphQLWorkOrderInput, GraphQLWorkOrderUpdateInput } from './workorder';

// Argument types for each operation
export interface GetWorkOrderArguments {
  accountId: string;
  workOrderId: string;
}

export interface CreateWorkOrderArguments {
  accountId: string;
  input: GraphQLWorkOrderInput;
}

export interface UpdateWorkOrderArguments {
  accountId: string;
  workOrderId: string;
  input: GraphQLWorkOrderUpdateInput;
}

export interface DeleteWorkOrderArguments {
  accountId: string;
  workOrderId: string;
}

export interface ListWorkOrdersArguments {
  accountId: string;
  pageSize?: number;
  cursor?: string;
}

// Re-export types from workorder.ts for convenience
export {
  WorkOrderStatus,
  WorkOrder,
  CreateWorkOrderRequest,
  UpdateWorkOrderRequest,
  PaginatedWorkOrderResponse,
  ProblemDetail,
  ValidationError,
  GraphQLWorkOrder,
  GraphQLWorkOrderInput,
  GraphQLWorkOrderUpdateInput,
  GraphQLWorkOrderListResponse
} from './workorder';