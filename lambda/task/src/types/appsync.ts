import { GraphQLTask, GraphQLTaskInput, GraphQLTaskUpdateInput, GraphQLTaskListResponse } from './task';

export interface AppSyncIdentity {
  claims?: {
    sub?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface AppSyncRequestHeaders {
  authorization?: string;
  [key: string]: string | undefined;
}

export interface AppSyncInfo {
  fieldName: string;
  parentTypeName: string;
  variables: Record<string, unknown>;
}

export interface AppSyncEvent<TArguments = Record<string, unknown>> {
  arguments: TArguments;
  identity?: AppSyncIdentity;
  source?: unknown;
  request?: {
    headers?: AppSyncRequestHeaders;
  };
  info: AppSyncInfo;
  prev?: {
    result?: unknown;
  };
}

// Argument types for each operation
export interface GetTaskArguments {
  accountId: string;
  taskId: string;
}

export interface CreateTaskArguments {
  accountId: string;
  input: GraphQLTaskInput;
}

export interface UpdateTaskArguments {
  accountId: string;
  taskId: string;
  input: GraphQLTaskUpdateInput;
}

export interface DeleteTaskArguments {
  accountId: string;
  taskId: string;
}

export interface ListTasksArguments {
  accountId: string;
  limit?: number;
  cursor?: string;
}

// Response types
export type GetTaskResponse = GraphQLTask;
export type CreateTaskResponse = GraphQLTask;
export type UpdateTaskResponse = GraphQLTask;
export type DeleteTaskResponse = boolean;
export type ListTasksResponse = GraphQLTaskListResponse;