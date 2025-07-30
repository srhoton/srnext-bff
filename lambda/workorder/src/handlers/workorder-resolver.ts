import { v4 as uuidv4 } from 'uuid';
import {
  AppSyncEvent,
  GetWorkOrderArguments,
  CreateWorkOrderArguments,
  UpdateWorkOrderArguments,
  DeleteWorkOrderArguments,
  ListWorkOrdersArguments,
  WorkOrder,
  CreateWorkOrderRequest,
  UpdateWorkOrderRequest,
  GraphQLWorkOrder,
  GraphQLWorkOrderInput,
  GraphQLWorkOrderUpdateInput,
  GraphQLWorkOrderListResponse,
} from '../types';
import { WorkOrdersApiService } from '../services/workorders-api';

export class WorkOrderResolver {
  private readonly workOrdersApiService: WorkOrdersApiService;
  private readonly jwtToken: string | undefined;
  private readonly jwtAccountId: string | undefined;

  constructor(event: AppSyncEvent) {
    const apiUrl = process.env['WORKORDERS_API_URL'] ?? 'https://workorder-srnext.sb.fullbay.com';
    this.workOrdersApiService = new WorkOrdersApiService(apiUrl);
    
    this.jwtToken = event.request?.headers?.authorization?.replace('Bearer ', '') ?? undefined;
    this.jwtAccountId = event.identity?.claims?.sub as string | undefined;
  }

  private validateAccountAccess(requestedAccountId: string): void {
    if (!this.jwtAccountId) {
      throw new Error('Authentication required: JWT token must be provided');
    }
    
    if (this.jwtAccountId !== requestedAccountId) {
      throw new Error('Access denied: accountId must match authenticated user');
    }
  }

  private convertTimestampToGraphQL(epochMilliseconds?: number | null): number | undefined {
    if (!epochMilliseconds) {
      return undefined;
    }
    // AWSTimestamp expects seconds, so convert from milliseconds
    const seconds = Math.floor(epochMilliseconds / 1000);
    
    // AWSTimestamp has a limit based on 32-bit signed integer (max value: 2147483647)
    // This represents January 19, 2038 03:14:07 GMT
    const maxTimestamp = 2147483647;
    
    if (seconds > maxTimestamp) {
      console.warn(`Timestamp ${seconds} exceeds AWSTimestamp max value. Capping at ${maxTimestamp}`);
      return maxTimestamp;
    }
    
    return seconds;
  }


  private workOrderToGraphQL(workOrder: WorkOrder): GraphQLWorkOrder {
    console.log('Converting workOrder to GraphQL:', JSON.stringify(workOrder, null, 2));
    
    const createdAtConverted = this.convertTimestampToGraphQL(workOrder.createdAt);
    const updatedAtConverted = this.convertTimestampToGraphQL(workOrder.updatedAt);
    
    console.log('Timestamp conversions:', {
      createdAt: { original: workOrder.createdAt, converted: createdAtConverted },
      updatedAt: { original: workOrder.updatedAt, converted: updatedAtConverted }
    });
    
    const result: GraphQLWorkOrder = {
      workOrderId: workOrder.workOrderId,
      accountId: workOrder.accountId,
      contactId: workOrder.contactId,
      unitId: workOrder.unitId,
      status: workOrder.status,
      description: workOrder.description,
      notes: workOrder.notes ?? [],
      createdAt: createdAtConverted ?? 0,
      updatedAt: updatedAtConverted ?? 0,
    };
    
    const deletedAt = this.convertTimestampToGraphQL(workOrder.deletedAt);
    if (deletedAt !== undefined) {
      result.deletedAt = deletedAt;
    }
    
    console.log('Final GraphQL result:', JSON.stringify(result, null, 2));
    
    return result;
  }

  private transformGraphQLInputToWorkOrder(input: GraphQLWorkOrderInput): Omit<CreateWorkOrderRequest, 'workOrderId'> {
    const result: Omit<CreateWorkOrderRequest, 'workOrderId'> = {
      contactId: input.contactId,
      unitId: input.unitId,
      status: input.status,
      description: input.description,
    };
    
    if (input.notes !== undefined) {
      result.notes = input.notes;
    }
    
    return result;
  }

  private transformGraphQLUpdateInputToWorkOrder(input: GraphQLWorkOrderUpdateInput): UpdateWorkOrderRequest {
    const update: UpdateWorkOrderRequest = {};
    
    if (input.contactId !== undefined) { update.contactId = input.contactId; }
    if (input.unitId !== undefined) { update.unitId = input.unitId; }
    if (input.status !== undefined) { update.status = input.status; }
    if (input.description !== undefined) { update.description = input.description; }
    if (input.notes !== undefined) { update.notes = input.notes; }
    
    return update;
  }

  async resolve(event: AppSyncEvent): Promise<unknown> {
    const fieldName = event.info.fieldName;
    console.log(`Resolving ${fieldName}`, JSON.stringify(event.arguments, null, 2));

    try {
      switch (fieldName) {
        case 'getWorkOrder':
          return await this.getWorkOrder(event as unknown as AppSyncEvent<GetWorkOrderArguments>);
        case 'createWorkOrder':
          return await this.createWorkOrder(event as unknown as AppSyncEvent<CreateWorkOrderArguments>);
        case 'updateWorkOrder':
          return await this.updateWorkOrder(event as unknown as AppSyncEvent<UpdateWorkOrderArguments>);
        case 'deleteWorkOrder':
          return await this.deleteWorkOrder(event as unknown as AppSyncEvent<DeleteWorkOrderArguments>);
        case 'listWorkOrders':
          return await this.listWorkOrders(event as unknown as AppSyncEvent<ListWorkOrdersArguments>);
        default:
          throw new Error(`Unknown field: ${fieldName}`);
      }
    } catch (error) {
      console.error(`Error in ${fieldName}:`, error);
      throw error;
    }
  }

  private async getWorkOrder(event: AppSyncEvent<GetWorkOrderArguments>): Promise<GraphQLWorkOrder> {
    const { accountId, workOrderId } = event.arguments;
    
    this.validateAccountAccess(accountId);
    
    const workOrder = await this.workOrdersApiService.getWorkOrder(accountId, workOrderId, this.jwtToken);
    return this.workOrderToGraphQL(workOrder);
  }

  private async createWorkOrder(event: AppSyncEvent<CreateWorkOrderArguments>): Promise<GraphQLWorkOrder> {
    const { accountId, input } = event.arguments;
    
    this.validateAccountAccess(accountId);
    
    const createInput = this.transformGraphQLInputToWorkOrder(input);
    
    // Generate workOrderId if not provided
    const workOrderId = uuidv4();
    
    const workOrderInput: CreateWorkOrderRequest = {
      ...createInput,
      workOrderId,
    };
    
    console.log('Creating work order with input:', JSON.stringify(workOrderInput, null, 2));
    
    const workOrder = await this.workOrdersApiService.createWorkOrder(accountId, workOrderInput, this.jwtToken);
    return this.workOrderToGraphQL(workOrder);
  }

  private async updateWorkOrder(event: AppSyncEvent<UpdateWorkOrderArguments>): Promise<GraphQLWorkOrder> {
    const { accountId, workOrderId, input } = event.arguments;
    
    this.validateAccountAccess(accountId);
    
    const updateInput = this.transformGraphQLUpdateInputToWorkOrder(input);
    
    console.log('Updating work order with input:', JSON.stringify(updateInput, null, 2));
    
    const workOrder = await this.workOrdersApiService.updateWorkOrder(accountId, workOrderId, updateInput, this.jwtToken);
    return this.workOrderToGraphQL(workOrder);
  }

  private async deleteWorkOrder(event: AppSyncEvent<DeleteWorkOrderArguments>): Promise<boolean> {
    const { accountId, workOrderId } = event.arguments;
    
    this.validateAccountAccess(accountId);
    
    const success = await this.workOrdersApiService.deleteWorkOrder(accountId, workOrderId, this.jwtToken);
    return success;
  }

  private async listWorkOrders(event: AppSyncEvent<ListWorkOrdersArguments>): Promise<GraphQLWorkOrderListResponse> {
    const { accountId, pageSize, cursor } = event.arguments;
    
    this.validateAccountAccess(accountId);
    
    const options: { pageSize?: number; cursor?: string } = {
      pageSize: pageSize ?? 20,
    };
    
    if (cursor !== undefined) { options.cursor = cursor; }
    
    const response = await this.workOrdersApiService.listWorkOrders(
      accountId,
      options,
      this.jwtToken
    );
    
    const result: GraphQLWorkOrderListResponse = {
      items: response.items.map(workOrder => this.workOrderToGraphQL(workOrder)),
      pageSize: options.pageSize ?? 20,
      count: response.items.length,
    };
    
    if (response.nextCursor !== undefined) {
      result.nextCursor = response.nextCursor;
    }
    
    return result;
  }
}