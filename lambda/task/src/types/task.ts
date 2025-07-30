export type TaskStatus = 'pending' | 'inProgress' | 'completed';

export interface Task {
  taskId: string;
  accountId: string;
  workOrderId: string;
  contactId: string;
  locationId: string;
  laborlinesId: string[];
  description: string;
  notes: string[];
  status: TaskStatus;
  estimateHours?: number;
  actualHours?: number;
  startDate?: number;
  endDate?: number;
  createdAt: number;
  updatedAt: number;
  deletedAt?: number;
  pk: string;
  sk: string;
}

export interface TaskCreateRequest {
  pk?: string; // Backend requires this field
  taskId?: string;
  workOrderId: string;
  contactId: string;
  locationId: string;
  laborlinesId?: string[];
  description?: string;
  notes?: string[];
  status?: TaskStatus;
  estimateHours?: number;
  actualHours?: number;
  startDate?: number;
  endDate?: number;
}

export interface TaskUpdateRequest {
  contactId?: string;
  locationId?: string;
  laborlinesId?: string[];
  description?: string;
  notes?: string[];
  status?: TaskStatus;
  estimateHours?: number;
  actualHours?: number;
  startDate?: number;
  endDate?: number;
}

export interface PaginatedTaskResponse {
  items: Task[];
  nextCursor?: string;
  limit: number;
  count: number;
}

export interface ErrorResponse {
  error: string;
  message: string;
  details?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
}

// GraphQL Types
export interface GraphQLTask {
  taskId: string;
  accountId: string;
  workOrderId: string;
  contactId: string;
  locationId: string;
  laborlinesId: string[];
  description: string;
  notes: string[];
  status: TaskStatus;
  estimateHours?: string;
  actualHours?: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface GraphQLTaskInput {
  workOrderId: string;
  contactId: string;
  locationId: string;
  laborlinesId?: string[];
  description?: string;
  notes?: string[];
  status?: TaskStatus;
  estimateHours?: number;
  actualHours?: number;
  startDate?: string;
  endDate?: string;
}

export interface GraphQLTaskUpdateInput {
  contactId?: string;
  locationId?: string;
  laborlinesId?: string[];
  description?: string;
  notes?: string[];
  status?: TaskStatus;
  estimateHours?: number;
  actualHours?: number;
  startDate?: string;
  endDate?: string;
}

export interface GraphQLTaskListResponse {
  items: GraphQLTask[];
  nextCursor?: string;
  limit: number;
  count: number;
}