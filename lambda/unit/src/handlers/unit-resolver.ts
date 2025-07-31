import {
  AppSyncResolverEvent,
  GetUnitArguments,
  ListUnitsArguments,
  CreateUnitArguments,
  UpdateUnitArguments,
  DeleteUnitArguments,
  GetUnitWithWorkOrdersArguments,
  UnauthorizedError,
  ValidationError,
  ListUnitsParams,
} from "../types";
import { UnitsApiService } from "../services/units-api.service";
import { CreateUnitInput, UpdateUnitInput } from "../types";

export class UnitResolver {
  /**
   * Extract JWT token from AppSync event
   */
  private static extractAuthToken<T>(event: AppSyncResolverEvent<T>): string {
    const authHeader = event.request.headers.authorization;
    if (authHeader === undefined || authHeader === null || authHeader === "") {
      throw new UnauthorizedError("Authorization header is missing");
    }
    // Extract just the token part, removing "Bearer " prefix
    return authHeader.replace(/^Bearer\s+/i, "");
  }

  /**
   * Extract account ID from JWT claims
   */
  private static extractAccountId<T>(event: AppSyncResolverEvent<T>): string {
    const sub = event.identity?.sub;
    if (!sub) {
      throw new UnauthorizedError("User identity not found in token");
    }
    return sub;
  }

  /**
   * Handle getUnit query
   */
  static getUnit(event: AppSyncResolverEvent<GetUnitArguments>): Promise<unknown> {
    const authToken = this.extractAuthToken(event);
    const accountId = this.extractAccountId(event);
    const { id } = event.arguments;

    if (!id) {
      throw new ValidationError("Unit ID is required");
    }

    const service = new UnitsApiService(authToken);
    return service.getUnit({ accountId, id });
  }

  /**
   * Handle listUnits query
   */
  static listUnits(event: AppSyncResolverEvent<ListUnitsArguments>): Promise<unknown> {
    const authToken = this.extractAuthToken(event);
    const accountId = this.extractAccountId(event);
    const { cursor, limit } = event.arguments;

    const service = new UnitsApiService(authToken);
    const params: ListUnitsParams = {
      accountId,
      limit: limit ?? 20,
    };
    if (cursor !== undefined && cursor !== null && cursor !== "") {
      params.cursor = cursor;
    }
    return service.listUnits(params);
  }

  /**
   * Handle createUnit mutation
   */
  static createUnit(event: AppSyncResolverEvent<CreateUnitArguments>): Promise<unknown> {
    const authToken = this.extractAuthToken(event);
    const accountId = this.extractAccountId(event);
    const { input } = event.arguments;

    if (input === undefined || input === null) {
      throw new ValidationError("Input is required");
    }

    if (!input.locationId || !input.suggestedVin) {
      throw new ValidationError("locationId and suggestedVin are required");
    }

    // Create unit object with required fields
    const { locationId, suggestedVin, ...otherInputFields } = input;
    const unitInput: CreateUnitInput = {
      accountId,
      locationId,
      suggestedVin,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      deletedAt: 0,
      unitType: "commercialVehicleType",
      ...otherInputFields, // Spread other optional fields
    };

    const service = new UnitsApiService(authToken);
    return service.createUnit({
      accountId,
      unit: unitInput,
    });
  }

  /**
   * Handle updateUnit mutation
   */
  static updateUnit(event: AppSyncResolverEvent<UpdateUnitArguments>): Promise<unknown> {
    const authToken = this.extractAuthToken(event);
    const accountId = this.extractAccountId(event);
    const { id, input } = event.arguments;

    if (!id) {
      throw new ValidationError("Unit ID is required");
    }

    if (input === undefined || input === null || Object.keys(input).length === 0) {
      throw new ValidationError("At least one field to update is required");
    }

    // Create update object with updated timestamp
    const unitUpdate: UpdateUnitInput = {
      id,
      updatedAt: Date.now(),
      ...input,
    };

    const service = new UnitsApiService(authToken);
    return service.updateUnit({
      accountId,
      id,
      unit: unitUpdate,
    });
  }

  /**
   * Handle getUnitWithWorkOrders query
   */
  static getUnitWithWorkOrders(event: AppSyncResolverEvent<GetUnitWithWorkOrdersArguments>): Promise<unknown> {
    const authToken = this.extractAuthToken(event);
    const accountId = this.extractAccountId(event);
    const { cursor, limit } = event.arguments;

    const service = new UnitsApiService(authToken);
    const params: ListUnitsParams = {
      accountId,
      limit: limit ?? 20,
    };
    if (cursor !== undefined && cursor !== null && cursor !== "") {
      params.cursor = cursor;
    }
    
    return service.getUnitsWithWorkOrders(params);
  }

  /**
   * Handle deleteUnit mutation
   */
  static async deleteUnit(event: AppSyncResolverEvent<DeleteUnitArguments>): Promise<unknown> {
    const authToken = this.extractAuthToken(event);
    const accountId = this.extractAccountId(event);
    const { id } = event.arguments;

    if (!id) {
      throw new ValidationError("Unit ID is required");
    }

    const service = new UnitsApiService(authToken);
    await service.deleteUnit({ accountId, id });

    // Return success response
    return {
      success: true,
      id,
      message: "Unit deleted successfully",
    };
  }
}