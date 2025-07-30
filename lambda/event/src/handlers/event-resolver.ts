import {
  AppSyncEvent,
  UnitEvent,
  CreateEventInput,
  UpdateEventInput,
  DeleteEventResponse,
  PagedEventResponse,
  GetEventParams,
  UpdateEventParams,
  DeleteEventParams,
  ListEventsParams,
  EventsByStatusConnection,
  EventWithUnitInfo,
  EventStatus,
} from '../types';
import { EventsApiService } from '../services/events-api.service';
import { UnitsApiService } from '../services/units-api.service';

export interface GetEventArguments {
  accountId: string;
  eventId: string;
}

export interface ListEventsArguments {
  accountId: string;
  unitId?: string;
  eventCategory?: string;
  status?: string;
  severity?: string;
  priority?: string;
  sourceSystem?: string;
  from?: string;
  to?: string;
  cursor?: string;
  limit?: number;
}

export interface CreateEventArguments {
  input: CreateEventInput;
}

export interface UpdateEventArguments {
  accountId: string;
  eventId: string;
  input: UpdateEventInput;
}

export interface DeleteEventArguments {
  accountId: string;
  eventId: string;
}

export interface ListEventsByStatusArguments {
  accountId: string;
  status?: EventStatus[];
  cursor?: string;
  limit?: number;
}

export class EventResolver {
  private readonly eventsApiService: EventsApiService;
  private readonly unitsApiService: UnitsApiService;
  private readonly jwtAccountId: string | undefined;

  constructor(authToken: string, jwtAccountId?: string) {
    this.eventsApiService = new EventsApiService(authToken);
    this.unitsApiService = new UnitsApiService(authToken);
    this.jwtAccountId = jwtAccountId;
  }

  async handleRequest(event: AppSyncEvent): Promise<unknown> {
    const { fieldName } = event.info;

    console.log(`Handling ${fieldName} request`, {
      arguments: event.arguments,
      identity: event.identity,
    });

    switch (fieldName) {
      case 'getEvent':
        return this.getEvent(event as unknown as AppSyncEvent<GetEventArguments>);
      case 'listEvents':
        return this.listEvents(event as unknown as AppSyncEvent<ListEventsArguments>);
      case 'listEventsByStatus':
        return this.listEventsByStatus(event as unknown as AppSyncEvent<ListEventsByStatusArguments>);
      case 'createEvent':
        return this.createEvent(event as unknown as AppSyncEvent<CreateEventArguments>);
      case 'updateEvent':
        return this.updateEvent(event as unknown as AppSyncEvent<UpdateEventArguments>);
      case 'deleteEvent':
        return this.deleteEvent(event as unknown as AppSyncEvent<DeleteEventArguments>);
      default:
        throw new Error(`Unknown field: ${fieldName}`);
    }
  }

  private async getEvent(event: AppSyncEvent<GetEventArguments>): Promise<UnitEvent> {
    const { accountId, eventId } = event.arguments;

    // Verify that the requested account ID matches the JWT sub claim
    if (accountId !== this.jwtAccountId) {
      throw new Error('Unauthorized: You can only access events for your own account');
    }

    const params: GetEventParams = { accountId, eventId };
    const unitEvent = await this.eventsApiService.getEvent(params);
    return this.convertTimestamps(unitEvent);
  }

  private async listEvents(event: AppSyncEvent<ListEventsArguments>): Promise<PagedEventResponse> {
    const { 
      accountId, 
      unitId, 
      eventCategory, 
      status, 
      severity, 
      priority, 
      sourceSystem, 
      from, 
      to, 
      cursor, 
      limit 
    } = event.arguments;

    // Verify that the requested account ID matches the JWT sub claim
    if (accountId !== this.jwtAccountId) {
      throw new Error('Unauthorized: You can only list events for your own account');
    }

    const params: ListEventsParams = {
      accountId,
      unitId,
      eventCategory: eventCategory as any,
      status: status as any,
      severity: severity as any,
      priority: priority as any,
      sourceSystem: sourceSystem as any,
      from,
      to,
      cursor,
      limit,
    };

    const response = await this.eventsApiService.listEvents(params);
    
    return {
      ...response,
      items: response.items.map(unitEvent => this.convertTimestamps(unitEvent)),
    };
  }

  private async createEvent(event: AppSyncEvent<CreateEventArguments>): Promise<UnitEvent> {
    const { input } = event.arguments;

    // For create operation, we require JWT but don't validate that accountId matches JWT sub claim
    // This allows creating events for any account, but still requires authentication
    if (!this.jwtAccountId) {
      throw new Error('Authentication required: JWT token must be provided');
    }

    // Transform the input to match backend API requirements
    const transformedInput = this.transformCreateEventInput(input);

    console.log('Transformed create event input:', JSON.stringify(transformedInput, null, 2));

    const unitEvent = await this.eventsApiService.createEvent(transformedInput);
    return this.convertTimestamps(unitEvent);
  }

  private async updateEvent(event: AppSyncEvent<UpdateEventArguments>): Promise<UnitEvent> {
    const { accountId, eventId, input } = event.arguments;

    // Verify that the account being updated matches the JWT sub claim
    if (accountId !== this.jwtAccountId) {
      throw new Error('Unauthorized: You can only update events for your own account');
    }

    const params: UpdateEventParams = { accountId, eventId };
    const unitEvent = await this.eventsApiService.updateEvent(params, input);
    return this.convertTimestamps(unitEvent);
  }

  private async deleteEvent(event: AppSyncEvent<DeleteEventArguments>): Promise<DeleteEventResponse> {
    const { accountId, eventId } = event.arguments;

    // Verify that the account being deleted from matches the JWT sub claim
    if (accountId !== this.jwtAccountId) {
      throw new Error('Unauthorized: You can only delete events for your own account');
    }

    const params: DeleteEventParams = { accountId, eventId };
    await this.eventsApiService.deleteEvent(params);

    return {
      success: true,
      accountId,
      eventId,
      message: 'Event deleted successfully',
    };
  }

  private transformCreateEventInput(input: any): any {
    // Generate required fields that are missing from GraphQL input
    const transformedInput = {
      ...input,
      // Generate unique eventId if not provided
      eventId: this.generateEventId(),
      // Set required createdAt timestamp
      createdAt: new Date().toISOString(),
      // Set default status
      status: 'created',
      // Transform field names to match backend schema
      extendedAttributes: input.extendedAttributes || {},
    };

    // Remove the old customData field if it exists
    if ('customData' in transformedInput) {
      delete transformedInput.customData;
    }

    // Ensure maintenance events have required maintenanceDetails
    if (input.eventCategory === 'maintenance' && !input.maintenanceDetails) {
      transformedInput.maintenanceDetails = {
        actionType: this.mapEventTypeToActionType(input.eventType),
      };
    }

    return transformedInput;
  }

  private generateEventId(): string {
    // Generate a unique event ID using timestamp and random component
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `evt_${timestamp}_${random}`;
  }

  private mapEventTypeToActionType(eventType: string): string {
    // Map GraphQL eventType to backend maintenance actionType
    const typeMapping: Record<string, string> = {
      'MAINTENANCE_REQUIRED': 'repair',
      'PREVENTIVE_MAINTENANCE': 'preventive_maintenance',
      'SCHEDULED_SERVICE': 'scheduled_service',
      'REPAIR': 'repair',
      'INSPECTION': 'inspection',
      'DIAGNOSTIC': 'diagnostic',
      'EMERGENCY_REPAIR': 'emergency_repair',
      'WARRANTY_REPAIR': 'warranty_repair',
      'RECALL': 'recall',
      'MODIFICATION': 'modification',
    };
    
    return typeMapping[eventType] || 'other';
  }

  private convertTimestamps(unitEvent: UnitEvent): any {
    return {
      ...unitEvent,
      createdAt: Math.floor(new Date(unitEvent.createdAt).getTime() / 1000),
      updatedAt: unitEvent.updatedAt 
        ? Math.floor(new Date(unitEvent.updatedAt).getTime() / 1000) 
        : undefined,
      acknowledgedAt: unitEvent.acknowledgedAt 
        ? Math.floor(new Date(unitEvent.acknowledgedAt).getTime() / 1000) 
        : undefined,
      deletedAt: unitEvent.deletedAt 
        ? Math.floor(new Date(unitEvent.deletedAt).getTime() / 1000) 
        : undefined,
    };
  }

  private async listEventsByStatus(event: AppSyncEvent<ListEventsByStatusArguments>): Promise<EventsByStatusConnection> {
    const { accountId, status: statusFilter, cursor, limit = 20 } = event.arguments;

    // Verify that the requested account ID matches the JWT sub claim
    if (accountId !== this.jwtAccountId) {
      throw new Error('Unauthorized: You can only list events for your own account');
    }

    console.log(`Fetching events by status for account ${accountId}`, { statusFilter, cursor, limit });

    // Step 1: Get all units for the account
    console.log('Step 1: Fetching all units for account');
    const units = await this.unitsApiService.getAllUnits(accountId);
    console.log(`Found ${units.length} units`);

    // Create a map of unitId to unit info for quick lookup
    const unitInfoMap = new Map(units.map(unit => [
      unit.id,
      {
        model: unit.model,
        modelYear: unit.modelYear,
        suggestedVin: unit.suggestedVin,
      }
    ]));

    // Step 2: Get all events for all units
    console.log('Step 2: Fetching events for all units');
    const allEvents: EventWithUnitInfo[] = [];
    
    // Fetch events for each unit in parallel (batch by 10 to avoid overwhelming the API)
    const batchSize = 10;
    for (let i = 0; i < units.length; i += batchSize) {
      const unitBatch = units.slice(i, i + batchSize);
      const eventPromises = unitBatch.map(async (unit) => {
        try {
          const params: ListEventsParams = {
            accountId,
            unitId: unit.id,
            // If status filter is provided, we'll filter after getting all events
            // since we need to sort across all units
          };
          
          const response = await this.eventsApiService.listEvents(params);
          
          // Add unit info to each event
          return response.items.map(unitEvent => ({
            ...this.convertTimestamps(unitEvent),
            unitInfo: unitInfoMap.get(unit.id) || {
              model: undefined,
              modelYear: undefined,
              suggestedVin: unit.suggestedVin,
            },
          }));
        } catch (error) {
          console.error(`Error fetching events for unit ${unit.id}:`, error);
          // Return empty array if there's an error for this unit
          return [];
        }
      });
      
      const batchResults = await Promise.all(eventPromises);
      batchResults.forEach(events => allEvents.push(...events));
    }

    console.log(`Total events fetched: ${allEvents.length}`);

    // Step 3: Filter by status if specified
    let filteredEvents = allEvents;
    if (statusFilter && statusFilter.length > 0) {
      filteredEvents = allEvents.filter(event => 
        statusFilter.includes(event.status as EventStatus)
      );
      console.log(`Events after status filter: ${filteredEvents.length}`);
    }

    // Step 4: Sort events by status (alphabetically)
    const statusOrder = [
      EventStatus.ACKNOWLEDGED,
      EventStatus.CANCELLED,
      EventStatus.CLOSED,
      EventStatus.CREATED,
      EventStatus.ESCALATED,
      EventStatus.IN_PROGRESS,
      EventStatus.ON_HOLD,
      EventStatus.RESOLVED,
    ];

    filteredEvents.sort((a, b) => {
      const statusIndexA = statusOrder.indexOf(a.status as EventStatus);
      const statusIndexB = statusOrder.indexOf(b.status as EventStatus);
      
      // First sort by status
      if (statusIndexA !== statusIndexB) {
        return statusIndexA - statusIndexB;
      }
      
      // Then sort by createdAt timestamp (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // Step 5: Implement cursor-based pagination
    let startIndex = 0;
    if (cursor) {
      try {
        // Decode cursor (base64 encoded index)
        startIndex = parseInt(Buffer.from(cursor, 'base64').toString('utf-8'), 10);
      } catch (error) {
        console.error('Invalid cursor:', error);
        // Invalid cursor, start from beginning
        startIndex = 0;
      }
    }

    const endIndex = startIndex + limit;
    const paginatedEvents = filteredEvents.slice(startIndex, endIndex);
    
    // Create next cursor if there are more events
    let nextCursor: string | undefined;
    if (endIndex < filteredEvents.length) {
      nextCursor = Buffer.from(endIndex.toString()).toString('base64');
    }

    return {
      items: paginatedEvents,
      nextCursor,
      limit,
      count: paginatedEvents.length,
    };
  }
}