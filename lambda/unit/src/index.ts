import { Handler } from "aws-lambda";

import { UnitResolver } from "./handlers/unit-resolver";
import {
  AppSyncResolverEvent,
  GetUnitArguments,
  ListUnitsArguments,
  CreateUnitArguments,
  UpdateUnitArguments,
  DeleteUnitArguments,
  GetUnitWithWorkOrdersArguments,
} from "./types";

/**
 * Main Lambda handler for AppSync resolver
 * Routes requests to appropriate resolver methods based on the field name
 */
export const handler: Handler<AppSyncResolverEvent, unknown> = async (
  event: AppSyncResolverEvent,
): Promise<unknown> => {
  // Log event only in development
  if (process.env["NODE_ENV"] !== "production") {
    console.warn("Received AppSync event:", JSON.stringify(event, null, 2));
  }

  try {
    const { fieldName } = event.info;

    switch (fieldName) {
      case "getUnit":
        return UnitResolver.getUnit(event as unknown as AppSyncResolverEvent<GetUnitArguments>);
      
      case "listUnits":
        return UnitResolver.listUnits(event as unknown as AppSyncResolverEvent<ListUnitsArguments>);
      
      case "createUnit":
        return UnitResolver.createUnit(event as unknown as AppSyncResolverEvent<CreateUnitArguments>);
      
      case "updateUnit":
        return UnitResolver.updateUnit(event as unknown as AppSyncResolverEvent<UpdateUnitArguments>);
      
      case "deleteUnit":
        return await UnitResolver.deleteUnit(event as unknown as AppSyncResolverEvent<DeleteUnitArguments>);
      
      case "getUnitWithWorkOrders":
        return UnitResolver.getUnitWithWorkOrders(event as unknown as AppSyncResolverEvent<GetUnitWithWorkOrdersArguments>);
      
      default:
        throw new Error(`Unknown field: ${fieldName}`);
    }
  } catch (error) {
    console.error("Error processing request:", error);
    
    // Format error for AppSync
    if (error instanceof Error) {
      return {
        error: error.message,
        errorType: error.name,
        // Include stack trace only in non-production environments
        ...(process.env["NODE_ENV"] !== "production" && { stack: error.stack }),
      };
    }
    
    return {
      error: "An unexpected error occurred",
      errorType: "InternalError",
    };
  }
};