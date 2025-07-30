import { v4 as uuidv4 } from 'uuid';
import {
  AppSyncEvent,
  LaborLine,
  CreateLaborLineInput,
  UpdateLaborLineInput,
  LaborLinePageResponse,
  DeleteLaborLineResponse,
} from '../types';
import { LaborLinesApiService } from '../services/laborlines-api.service';

// GraphQL operation argument types
interface GetLaborLineArguments {
  accountId: string;
  laborLineId: string;
}

interface ListLaborLinesArguments {
  accountId: string;
  taskId?: string;
  cursor?: string;
  limit?: number;
}

interface CreateLaborLineArguments {
  accountId: string;
  input: CreateLaborLineInput;
}

interface UpdateLaborLineArguments {
  accountId: string;
  laborLineId: string;
  input: UpdateLaborLineInput;
}

interface DeleteLaborLineArguments {
  accountId: string;
  laborLineId: string;
}

export class LaborLineResolver {
  private jwtAccountId: string | null = null;
  private laborLinesApiService: LaborLinesApiService | null = null;

  constructor(authToken?: string) {
    if (authToken) {
      this.laborLinesApiService = new LaborLinesApiService(authToken);
    }
  }

  private extractJwtAccountId(event: AppSyncEvent): string {
    const sub = event.identity?.claims?.sub;
    if (!sub) {
      throw new Error('Authentication required: JWT token must be provided');
    }
    return sub;
  }

  private validateAccountAccess(requestedAccountId: string): void {
    if (!this.jwtAccountId) {
      throw new Error('Authentication required: JWT token must be provided');
    }
    
    if (this.jwtAccountId !== requestedAccountId) {
      throw new Error('Access denied: accountId must match authenticated user');
    }
  }

  private ensureApiService(): LaborLinesApiService {
    if (!this.laborLinesApiService) {
      throw new Error('API service not initialized - authentication required');
    }
    return this.laborLinesApiService;
  }

  async handleRequest(event: AppSyncEvent): Promise<unknown> {
    console.log('Received AppSync event:', JSON.stringify(event, null, 2));

    try {
      // Extract JWT account ID from the event
      this.jwtAccountId = this.extractJwtAccountId(event);
      console.log('Authenticated user (JWT sub):', this.jwtAccountId);

      const fieldName = event.info?.fieldName;
      
      switch (fieldName) {
        case 'getLaborLine':
          return await this.getLaborLine(event as unknown as AppSyncEvent<GetLaborLineArguments>);
        case 'listLaborLines':
          return await this.listLaborLines(event as unknown as AppSyncEvent<ListLaborLinesArguments>);
        case 'createLaborLine':
          return await this.createLaborLine(event as unknown as AppSyncEvent<CreateLaborLineArguments>);
        case 'updateLaborLine':
          return await this.updateLaborLine(event as unknown as AppSyncEvent<UpdateLaborLineArguments>);
        case 'deleteLaborLine':
          return await this.deleteLaborLine(event as unknown as AppSyncEvent<DeleteLaborLineArguments>);
        default:
          throw new Error(`Unknown field: ${fieldName}`);
      }
    } catch (error) {
      console.error('Error handling request:', error);
      throw error;
    }
  }

  private async getLaborLine(event: AppSyncEvent<GetLaborLineArguments>): Promise<LaborLine> {
    const { accountId, laborLineId } = event.arguments;
    
    // Validate that the requested accountId matches the JWT sub claim
    this.validateAccountAccess(accountId);
    
    console.log(`Getting labor line: ${laborLineId} for account: ${accountId}`);
    
    const apiService = this.ensureApiService();
    const laborLine = await apiService.getLaborLine({ accountId, laborLineId });
    
    console.log('Labor line retrieved successfully');
    return laborLine;
  }

  private async listLaborLines(event: AppSyncEvent<ListLaborLinesArguments>): Promise<LaborLinePageResponse> {
    const { accountId, taskId, cursor, limit } = event.arguments;
    
    // Validate that the requested accountId matches the JWT sub claim
    this.validateAccountAccess(accountId);
    
    console.log(`Listing labor lines for account: ${accountId}, taskId: ${taskId || 'all'}`);
    
    const apiService = this.ensureApiService();
    const result = await apiService.listLaborLines({
      accountId,
      taskId,
      cursor,
      limit,
    });
    
    console.log(`Retrieved ${result.items.length} labor lines`);
    return result;
  }

  private async createLaborLine(event: AppSyncEvent<CreateLaborLineArguments>): Promise<LaborLine> {
    const { accountId, input } = event.arguments;
    
    // Validate that the requested accountId matches the JWT sub claim
    this.validateAccountAccess(accountId);
    
    console.log(`Creating labor line for account: ${accountId}`);
    
    // Generate laborLineId if not provided
    const createInput: CreateLaborLineInput = {
      ...input,
      laborLineId: input.laborLineId || uuidv4(),
    };
    
    console.log('Create labor line input:', JSON.stringify(createInput, null, 2));
    
    const apiService = this.ensureApiService();
    const laborLine = await apiService.createLaborLine({ accountId }, createInput);
    
    console.log('Labor line created successfully');
    return laborLine;
  }

  private async updateLaborLine(event: AppSyncEvent<UpdateLaborLineArguments>): Promise<LaborLine> {
    const { accountId, laborLineId, input } = event.arguments;
    
    // Validate that the requested accountId matches the JWT sub claim
    this.validateAccountAccess(accountId);
    
    console.log(`Updating labor line: ${laborLineId} for account: ${accountId}`);
    console.log('Update labor line input:', JSON.stringify(input, null, 2));
    
    const apiService = this.ensureApiService();
    const laborLine = await apiService.updateLaborLine({ accountId, laborLineId }, input);
    
    console.log('Labor line updated successfully');
    return laborLine;
  }

  private async deleteLaborLine(event: AppSyncEvent<DeleteLaborLineArguments>): Promise<DeleteLaborLineResponse> {
    const { accountId, laborLineId } = event.arguments;
    
    // Validate that the requested accountId matches the JWT sub claim
    this.validateAccountAccess(accountId);
    
    console.log(`Deleting labor line: ${laborLineId} for account: ${accountId}`);
    
    const apiService = this.ensureApiService();
    await apiService.deleteLaborLine({ accountId, laborLineId });
    
    console.log('Labor line deleted successfully');
    return {
      success: true,
      accountId,
      laborLineId,
      message: 'Labor line deleted successfully',
    };
  }
}