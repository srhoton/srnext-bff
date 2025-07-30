import { v4 as uuidv4 } from 'uuid';
import {
  AppSyncEvent,
  GetTaskArguments,
  CreateTaskArguments,
  UpdateTaskArguments,
  DeleteTaskArguments,
  ListTasksArguments,
  Task,
  TaskCreateRequest,
  TaskUpdateRequest,
  GraphQLTask,
  GraphQLTaskInput,
  GraphQLTaskUpdateInput,
  GraphQLTaskListResponse,
} from '../types';
import { TasksApiService } from '../services/tasks-api';

export class TaskResolver {
  private readonly tasksApiService: TasksApiService;
  private readonly jwtToken: string | undefined;
  private readonly jwtAccountId: string | undefined;

  constructor(event: AppSyncEvent) {
    const apiUrl = process.env['TASKS_API_URL'] ?? 'https://srnext-tasks.sb.fullbay.com';
    this.tasksApiService = new TasksApiService(apiUrl);
    
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

  private convertTimestampToGraphQL(epochSeconds?: number): string | undefined {
    if (!epochSeconds) {
      return undefined;
    }
    // Convert epoch seconds to milliseconds for AWSTimestamp
    return (epochSeconds * 1000).toString();
  }

  private convertTimestampFromGraphQL(awsTimestamp?: string): number | undefined {
    if (!awsTimestamp) {
      return undefined;
    }
    // Convert AWSTimestamp (milliseconds) to epoch seconds
    const ms = parseInt(awsTimestamp, 10);
    return Math.floor(ms / 1000);
  }

  private taskToGraphQL(task: Task): GraphQLTask {
    const result: GraphQLTask = {
      taskId: task.taskId,
      accountId: task.accountId,
      workOrderId: task.workOrderId,
      contactId: task.contactId,
      locationId: task.locationId,
      laborlinesId: task.laborlinesId,
      description: task.description,
      notes: task.notes,
      status: task.status,
      createdAt: this.convertTimestampToGraphQL(task.createdAt) ?? '0',
      updatedAt: this.convertTimestampToGraphQL(task.updatedAt) ?? '0',
    };
    
    if (task.estimateHours !== undefined) {
      result.estimateHours = task.estimateHours.toString();
    }
    
    if (task.actualHours !== undefined) {
      result.actualHours = task.actualHours.toString();
    }
    
    const startDate = this.convertTimestampToGraphQL(task.startDate);
    if (startDate !== undefined) {
      result.startDate = startDate;
    }
    
    const endDate = this.convertTimestampToGraphQL(task.endDate);
    if (endDate !== undefined) {
      result.endDate = endDate;
    }
    
    const deletedAt = this.convertTimestampToGraphQL(task.deletedAt);
    if (deletedAt !== undefined) {
      result.deletedAt = deletedAt;
    }
    
    return result;
  }

  private transformGraphQLInputToTask(input: GraphQLTaskInput): Omit<TaskCreateRequest, 'taskId'> {
    const result: Omit<TaskCreateRequest, 'taskId'> = {
      workOrderId: input.workOrderId,
      contactId: input.contactId,
      locationId: input.locationId,
    };
    
    if (input.laborlinesId !== undefined) { result.laborlinesId = input.laborlinesId; }
    if (input.description !== undefined) { result.description = input.description; }
    if (input.notes !== undefined) { result.notes = input.notes; }
    if (input.status !== undefined) { result.status = input.status; }
    if (input.estimateHours !== undefined) { result.estimateHours = input.estimateHours; }
    if (input.actualHours !== undefined) { result.actualHours = input.actualHours; }
    
    const startDate = this.convertTimestampFromGraphQL(input.startDate);
    if (startDate !== undefined) { result.startDate = startDate; }
    
    const endDate = this.convertTimestampFromGraphQL(input.endDate);
    if (endDate !== undefined) { result.endDate = endDate; }
    
    return result;
  }

  private transformGraphQLUpdateInputToTask(input: GraphQLTaskUpdateInput): TaskUpdateRequest {
    const update: TaskUpdateRequest = {};
    
    if (input.contactId !== undefined) { update.contactId = input.contactId; }
    if (input.locationId !== undefined) { update.locationId = input.locationId; }
    if (input.laborlinesId !== undefined) { update.laborlinesId = input.laborlinesId; }
    if (input.description !== undefined) { update.description = input.description; }
    if (input.notes !== undefined) { update.notes = input.notes; }
    if (input.status !== undefined) { update.status = input.status; }
    if (input.estimateHours !== undefined) { update.estimateHours = input.estimateHours; }
    if (input.actualHours !== undefined) { update.actualHours = input.actualHours; }
    
    if (input.startDate !== undefined) {
      const startDate = this.convertTimestampFromGraphQL(input.startDate);
      if (startDate !== undefined) { update.startDate = startDate; }
    }
    
    if (input.endDate !== undefined) {
      const endDate = this.convertTimestampFromGraphQL(input.endDate);
      if (endDate !== undefined) { update.endDate = endDate; }
    }
    
    return update;
  }

  async resolve(event: AppSyncEvent): Promise<unknown> {
    const fieldName = event.info.fieldName;
    console.log(`Resolving ${fieldName}`, JSON.stringify(event.arguments, null, 2));

    try {
      switch (fieldName) {
        case 'getTask':
          return await this.getTask(event as unknown as AppSyncEvent<GetTaskArguments>);
        case 'createTask':
          return await this.createTask(event as unknown as AppSyncEvent<CreateTaskArguments>);
        case 'updateTask':
          return await this.updateTask(event as unknown as AppSyncEvent<UpdateTaskArguments>);
        case 'deleteTask':
          return await this.deleteTask(event as unknown as AppSyncEvent<DeleteTaskArguments>);
        case 'listTasks':
          return await this.listTasks(event as unknown as AppSyncEvent<ListTasksArguments>);
        default:
          throw new Error(`Unknown field: ${fieldName}`);
      }
    } catch (error) {
      console.error(`Error in ${fieldName}:`, error);
      throw error;
    }
  }

  private async getTask(event: AppSyncEvent<GetTaskArguments>): Promise<GraphQLTask> {
    const { accountId, taskId } = event.arguments;
    
    this.validateAccountAccess(accountId);
    
    const task = await this.tasksApiService.getTask(accountId, taskId, this.jwtToken);
    return this.taskToGraphQL(task);
  }

  private async createTask(event: AppSyncEvent<CreateTaskArguments>): Promise<GraphQLTask> {
    const { accountId, input } = event.arguments;
    
    this.validateAccountAccess(accountId);
    
    const createInput = this.transformGraphQLInputToTask(input);
    
    // Generate taskId if not provided
    const taskId = uuidv4();
    
    const taskInput: TaskCreateRequest = {
      ...createInput,
      pk: accountId, // Backend requires this field - must come after spread
      taskId,
    };
    
    console.log('Creating task with input:', JSON.stringify(taskInput, null, 2));
    
    const task = await this.tasksApiService.createTask(accountId, taskInput, this.jwtToken);
    return this.taskToGraphQL(task);
  }

  private async updateTask(event: AppSyncEvent<UpdateTaskArguments>): Promise<GraphQLTask> {
    const { accountId, taskId, input } = event.arguments;
    
    this.validateAccountAccess(accountId);
    
    const updateInput = this.transformGraphQLUpdateInputToTask(input);
    
    console.log('Updating task with input:', JSON.stringify(updateInput, null, 2));
    
    const task = await this.tasksApiService.updateTask(accountId, taskId, updateInput, this.jwtToken);
    return this.taskToGraphQL(task);
  }

  private async deleteTask(event: AppSyncEvent<DeleteTaskArguments>): Promise<boolean> {
    const { accountId, taskId } = event.arguments;
    
    this.validateAccountAccess(accountId);
    
    const success = await this.tasksApiService.deleteTask(accountId, taskId, this.jwtToken);
    return success;
  }

  private async listTasks(event: AppSyncEvent<ListTasksArguments>): Promise<GraphQLTaskListResponse> {
    const { accountId, limit, cursor } = event.arguments;
    
    this.validateAccountAccess(accountId);
    
    const options: { limit?: number; cursor?: string } = {
      limit: limit ?? 20,
    };
    
    if (cursor !== undefined) { options.cursor = cursor; }
    
    const response = await this.tasksApiService.listTasks(
      accountId,
      options,
      this.jwtToken
    );
    
    const result: GraphQLTaskListResponse = {
      items: response.items.map(task => this.taskToGraphQL(task)),
      limit: response.limit,
      count: response.count,
    };
    
    if (response.nextCursor !== null && response.nextCursor !== undefined) {
      result.nextCursor = response.nextCursor;
    }
    
    return result;
  }
}