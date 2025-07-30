import { Handler } from "aws-lambda";

import { UnitResolver } from "./handlers/unit-resolver";
import { AppSyncResolverEvent } from "./types";

/**
 * Main Lambda handler for AppSync resolver
 * Routes requests to appropriate resolver methods based on the field name
 */
export const handler: Handler<AppSyncResolverEvent, unknown> = async (
  event: AppSyncResolverEvent,
): Promise<unknown> => {
  console.log("Received AppSync event:", JSON.stringify(event, null, 2));

  try {
    const { fieldName } = event.info;

    switch (fieldName) {
      case "getUnit":
        return await UnitResolver.getUnit(event as any);
      
      case "listUnits":
        return await UnitResolver.listUnits(event as any);
      
      case "createUnit":
        return await UnitResolver.createUnit(event as any);
      
      case "updateUnit":
        return await UnitResolver.updateUnit(event as any);
      
      case "deleteUnit":
        return await UnitResolver.deleteUnit(event as any);
      
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