import { v4 as uuidv4 } from 'uuid';
import {
  AppSyncEvent,
  GetPartArguments,
  CreatePartArguments,
  UpdatePartArguments,
  DeletePartArguments,
  ListPartsArguments,
  Part,
  PartCreateInput,
  PartUpdateInput,
  GraphQLPartListResponse,
  GraphQLPartInput,
  GraphQLPartUpdateInput,
} from '../types';
import { PartsApiService } from '../services/parts-api';

export class PartResolver {
  private readonly partsApiService: PartsApiService;
  private readonly jwtToken: string | undefined;
  private readonly jwtAccountId: string | undefined;

  constructor(event: AppSyncEvent) {
    const apiUrl = process.env['PARTS_API_URL'] ?? 'https://part-srnext.sb.fullbay.com';
    this.partsApiService = new PartsApiService(apiUrl);
    
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

  private parseTimestamp(value: string | undefined): number | undefined {
    if (!value) {
      return undefined;
    }
    const num = parseInt(value, 10);
    return isNaN(num) ? undefined : num;
  }

  private parseJSON<T>(value: string | undefined): T | undefined {
    if (!value) {
      return undefined;
    }
    try {
      return JSON.parse(value) as T;
    } catch {
      console.warn('Failed to parse JSON:', value);
      return undefined;
    }
  }

  private transformGraphQLInputToPart(input: GraphQLPartInput): Omit<PartCreateInput, 'partId' | 'sortKey'> {
    const result: Omit<PartCreateInput, 'partId' | 'sortKey'> = {
      partNumber: input.partNumber,
      description: input.description,
      manufacturer: input.manufacturer,
      category: input.category,
      condition: input.condition,
      status: input.status,
      quantity: input.quantity,
    };
    
    if (input.subcategory !== undefined) { result.subcategory = input.subcategory; }
    if (input.unitId !== undefined) { result.unitId = input.unitId; }
    if (input.locationId !== undefined) { result.locationId = input.locationId; }
    if (input.serialNumber !== undefined) { result.serialNumber = input.serialNumber; }
    if (input.batchNumber !== undefined) { result.batchNumber = input.batchNumber; }
    
    const installDate = this.parseTimestamp(input.installDate);
    if (installDate !== undefined) { result.installDate = installDate; }
    
    const purchaseDate = this.parseTimestamp(input.purchaseDate);
    if (purchaseDate !== undefined) { result.purchaseDate = purchaseDate; }
    
    const warrantyExpiration = this.parseTimestamp(input.warrantyExpiration);
    if (warrantyExpiration !== undefined) { result.warrantyExpiration = warrantyExpiration; }
    
    if (input.vendor !== undefined) { result.vendor = input.vendor; }
    if (input.weight !== undefined) { result.weight = input.weight; }
    if (input.dimensions !== undefined) { result.dimensions = input.dimensions; }
    
    const specifications = this.parseJSON<Record<string, string>>(input.specifications);
    if (specifications !== undefined) { result.specifications = specifications; }
    
    const extendedAttributes = this.parseJSON<Record<string, string | number | boolean | string[]>>(input.extendedAttributes);
    if (extendedAttributes !== undefined) { result.extendedAttributes = extendedAttributes; }
    
    if (input.tags !== undefined) { result.tags = input.tags; }
    if (input.notes !== undefined) { result.notes = input.notes; }
    
    return result;
  }

  private transformGraphQLUpdateInputToPart(input: GraphQLPartUpdateInput): PartUpdateInput {
    const update: PartUpdateInput = {};
    
    if (input.partNumber !== undefined) { update.partNumber = input.partNumber; }
    if (input.description !== undefined) { update.description = input.description; }
    if (input.manufacturer !== undefined) { update.manufacturer = input.manufacturer; }
    if (input.category !== undefined) { update.category = input.category; }
    if (input.subcategory !== undefined) { update.subcategory = input.subcategory; }
    if (input.unitId !== undefined) { update.unitId = input.unitId; }
    if (input.locationId !== undefined) { update.locationId = input.locationId; }
    if (input.condition !== undefined) { update.condition = input.condition; }
    if (input.status !== undefined) { update.status = input.status; }
    if (input.quantity !== undefined) { update.quantity = input.quantity; }
    if (input.serialNumber !== undefined) { update.serialNumber = input.serialNumber; }
    if (input.batchNumber !== undefined) { update.batchNumber = input.batchNumber; }
    
    if (input.installDate !== undefined) {
      const installDate = this.parseTimestamp(input.installDate);
      if (installDate !== undefined) { update.installDate = installDate; }
    }
    
    if (input.purchaseDate !== undefined) {
      const purchaseDate = this.parseTimestamp(input.purchaseDate);
      if (purchaseDate !== undefined) { update.purchaseDate = purchaseDate; }
    }
    
    if (input.warrantyExpiration !== undefined) {
      const warrantyExpiration = this.parseTimestamp(input.warrantyExpiration);
      if (warrantyExpiration !== undefined) { update.warrantyExpiration = warrantyExpiration; }
    }
    
    if (input.vendor !== undefined) { update.vendor = input.vendor; }
    if (input.weight !== undefined) { update.weight = input.weight; }
    if (input.dimensions !== undefined) { update.dimensions = input.dimensions; }
    
    if (input.specifications !== undefined) {
      const specifications = this.parseJSON<Record<string, string>>(input.specifications);
      if (specifications !== undefined) { update.specifications = specifications; }
    }
    
    if (input.extendedAttributes !== undefined) {
      const extendedAttributes = this.parseJSON<Record<string, string | number | boolean | string[]>>(input.extendedAttributes);
      if (extendedAttributes !== undefined) { update.extendedAttributes = extendedAttributes; }
    }
    
    if (input.tags !== undefined) { update.tags = input.tags; }
    if (input.notes !== undefined) { update.notes = input.notes; }
    
    return update;
  }

  private generateSortKey(locationId?: string, unitId?: string, partId?: string): string {
    const actualPartId = partId ?? uuidv4();
    
    if (locationId) {
      return `location#${locationId}#${actualPartId}`;
    } else if (unitId) {
      return `unit#${unitId}#${actualPartId}`;
    } else {
      throw new Error('Either locationId or unitId must be provided');
    }
  }

  private extractPartIdFromSortKey(sortKey: string): string {
    const parts = sortKey.split('#');
    if (parts.length !== 3) {
      throw new Error('Invalid sortKey format');
    }
    return parts[2] ?? '';
  }


  async resolve(event: AppSyncEvent): Promise<unknown> {
    const fieldName = event.info.fieldName;
    console.log(`Resolving ${fieldName}`, JSON.stringify(event.arguments, null, 2));

    try {
      switch (fieldName) {
        case 'getPart':
          return await this.getPart(event as unknown as AppSyncEvent<GetPartArguments>);
        case 'createPart':
          return await this.createPart(event as unknown as AppSyncEvent<CreatePartArguments>);
        case 'updatePart':
          return await this.updatePart(event as unknown as AppSyncEvent<UpdatePartArguments>);
        case 'deletePart':
          return await this.deletePart(event as unknown as AppSyncEvent<DeletePartArguments>);
        case 'listParts':
          return await this.listParts(event as unknown as AppSyncEvent<ListPartsArguments>);
        default:
          throw new Error(`Unknown field: ${fieldName}`);
      }
    } catch (error) {
      console.error(`Error in ${fieldName}:`, error);
      throw error;
    }
  }

  private async getPart(event: AppSyncEvent<GetPartArguments>): Promise<Part> {
    const { accountId, partId } = event.arguments;
    
    this.validateAccountAccess(accountId);
    
    const parts = await this.partsApiService.listParts(
      accountId,
      { limit: 100 },
      this.jwtToken
    );
    
    const part = parts.data.find(p => {
      const extractedPartId = this.extractPartIdFromSortKey(p.sortKey);
      return extractedPartId === partId;
    });
    
    if (!part) {
      throw new Error(`Part not found: ${partId}`);
    }
    
    return part;
  }

  private async createPart(event: AppSyncEvent<CreatePartArguments>): Promise<Part> {
    const { accountId, input } = event.arguments;
    
    this.validateAccountAccess(accountId);
    
    const createInput = this.transformGraphQLInputToPart(input);
    
    const partId = uuidv4();
    const sortKey = this.generateSortKey(createInput.locationId, createInput.unitId, partId);
    
    const partInput: PartCreateInput = {
      partId,
      sortKey,
      ...createInput,
    };
    
    console.log('Creating part with input:', JSON.stringify(partInput, null, 2));
    
    const part = await this.partsApiService.createPart(accountId, partInput, this.jwtToken);
    return part;
  }

  private async updatePart(event: AppSyncEvent<UpdatePartArguments>): Promise<Part> {
    const { accountId, partId, input } = event.arguments;
    
    this.validateAccountAccess(accountId);
    
    const parts = await this.partsApiService.listParts(
      accountId,
      { limit: 100 },
      this.jwtToken
    );
    
    const existingPart = parts.data.find(p => {
      const extractedPartId = this.extractPartIdFromSortKey(p.sortKey);
      return extractedPartId === partId;
    });
    
    if (!existingPart) {
      throw new Error(`Part not found: ${partId}`);
    }
    
    const updateInput = this.transformGraphQLUpdateInputToPart(input);
    
    let newSortKey = existingPart.sortKey;
    if (input.locationId || input.unitId) {
      const locationId = input.locationId ?? existingPart.locationId;
      const unitId = input.unitId ?? existingPart.unitId;
      
      if (locationId && unitId) {
        throw new Error('Part cannot be associated with both location and unit');
      }
      
      newSortKey = this.generateSortKey(locationId, unitId, partId);
    }
    
    console.log('Updating part with input:', JSON.stringify(updateInput, null, 2));
    
    const part = await this.partsApiService.updatePart(accountId, newSortKey, updateInput, this.jwtToken);
    return part;
  }

  private async deletePart(event: AppSyncEvent<DeletePartArguments>): Promise<boolean> {
    const { accountId, partId } = event.arguments;
    
    this.validateAccountAccess(accountId);
    
    const parts = await this.partsApiService.listParts(
      accountId,
      { limit: 100 },
      this.jwtToken
    );
    
    const part = parts.data.find(p => {
      const extractedPartId = this.extractPartIdFromSortKey(p.sortKey);
      return extractedPartId === partId;
    });
    
    if (!part) {
      throw new Error(`Part not found: ${partId}`);
    }
    
    const success = await this.partsApiService.deletePart(accountId, part.sortKey, this.jwtToken);
    return success;
  }

  private async listParts(event: AppSyncEvent<ListPartsArguments>): Promise<GraphQLPartListResponse> {
    const { accountId, locationId, unitId, limit, cursor } = event.arguments;
    
    this.validateAccountAccess(accountId);
    
    const options: { locationId?: string; unitId?: string; limit?: number; cursor?: string } = {
      limit: limit ?? 20,
    };
    
    if (locationId !== undefined) { options.locationId = locationId; }
    if (unitId !== undefined) { options.unitId = unitId; }
    if (cursor !== undefined) { options.cursor = cursor; }
    
    const response = await this.partsApiService.listParts(
      accountId,
      options,
      this.jwtToken
    );
    
    const result: GraphQLPartListResponse = {
      items: response.data,
      limit: response.pagination.limit,
      count: response.pagination.count,
    };
    
    if (response.pagination.nextCursor !== null && response.pagination.nextCursor !== undefined) {
      result.nextCursor = response.pagination.nextCursor;
    }
    
    return result;
  }
}