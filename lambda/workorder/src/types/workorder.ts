export type WorkOrderStatus = 'draft' | 'pending' | 'inProgress' | 'completed';

export interface WorkOrder {
  workOrderId: string;
  accountId: string;
  contactId: string;
  unitId: string;
  status: WorkOrderStatus;
  description: string;
  notes: string[];
  createdAt: number; // epoch milliseconds
  updatedAt: number; // epoch milliseconds
  deletedAt?: number | null; // epoch milliseconds
}

export interface CreateWorkOrderRequest {
  workOrderId?: string;
  contactId: string;
  unitId: string;
  status: WorkOrderStatus;
  description: string;
  notes?: string[];
}

export interface UpdateWorkOrderRequest {
  contactId?: string;
  unitId?: string;
  status?: WorkOrderStatus;
  description?: string;
  notes?: string[];
}

export interface PaginatedWorkOrderResponse {
  items: WorkOrder[];
  nextCursor?: string;
}

export interface ProblemDetail {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  validation_errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
}

// GraphQL Types
export interface GraphQLWorkOrder {
  workOrderId: string;
  accountId: string;
  contactId: string;
  unitId: string;
  status: WorkOrderStatus;
  description: string;
  notes: string[];
  createdAt: number; // AWSTimestamp as number
  updatedAt: number; // AWSTimestamp as number
  deletedAt?: number; // AWSTimestamp as number
}

export interface GraphQLWorkOrderInput {
  contactId: string;
  unitId: string;
  status: WorkOrderStatus;
  description: string;
  notes?: string[];
}

export interface GraphQLWorkOrderUpdateInput {
  contactId?: string;
  unitId?: string;
  status?: WorkOrderStatus;
  description?: string;
  notes?: string[];
}

export interface GraphQLWorkOrderListResponse {
  items: GraphQLWorkOrder[];
  nextCursor?: string;
  pageSize: number;
  count: number;
}