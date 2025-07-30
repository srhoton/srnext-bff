"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventResolver = void 0;
const types_1 = require("../types");
const events_api_service_1 = require("../services/events-api.service");
const units_api_service_1 = require("../services/units-api.service");
class EventResolver {
    eventsApiService;
    unitsApiService;
    jwtAccountId;
    constructor(authToken, jwtAccountId) {
        this.eventsApiService = new events_api_service_1.EventsApiService(authToken);
        this.unitsApiService = new units_api_service_1.UnitsApiService(authToken);
        this.jwtAccountId = jwtAccountId;
    }
    async handleRequest(event) {
        const { fieldName } = event.info;
        console.log(`Handling ${fieldName} request`, {
            arguments: event.arguments,
            identity: event.identity,
        });
        switch (fieldName) {
            case 'getEvent':
                return this.getEvent(event);
            case 'listEvents':
                return this.listEvents(event);
            case 'listEventsByStatus':
                return this.listEventsByStatus(event);
            case 'createEvent':
                return this.createEvent(event);
            case 'updateEvent':
                return this.updateEvent(event);
            case 'deleteEvent':
                return this.deleteEvent(event);
            default:
                throw new Error(`Unknown field: ${fieldName}`);
        }
    }
    async getEvent(event) {
        const { accountId, eventId } = event.arguments;
        // Verify that the requested account ID matches the JWT sub claim
        if (accountId !== this.jwtAccountId) {
            throw new Error('Unauthorized: You can only access events for your own account');
        }
        const params = { accountId, eventId };
        const unitEvent = await this.eventsApiService.getEvent(params);
        return this.convertTimestamps(unitEvent);
    }
    async listEvents(event) {
        const { accountId, unitId, eventCategory, status, severity, priority, sourceSystem, from, to, cursor, limit } = event.arguments;
        // Verify that the requested account ID matches the JWT sub claim
        if (accountId !== this.jwtAccountId) {
            throw new Error('Unauthorized: You can only list events for your own account');
        }
        const params = {
            accountId,
            unitId,
            eventCategory: eventCategory,
            status: status,
            severity: severity,
            priority: priority,
            sourceSystem: sourceSystem,
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
    async createEvent(event) {
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
    async updateEvent(event) {
        const { accountId, eventId, input } = event.arguments;
        // Verify that the account being updated matches the JWT sub claim
        if (accountId !== this.jwtAccountId) {
            throw new Error('Unauthorized: You can only update events for your own account');
        }
        const params = { accountId, eventId };
        const unitEvent = await this.eventsApiService.updateEvent(params, input);
        return this.convertTimestamps(unitEvent);
    }
    async deleteEvent(event) {
        const { accountId, eventId } = event.arguments;
        // Verify that the account being deleted from matches the JWT sub claim
        if (accountId !== this.jwtAccountId) {
            throw new Error('Unauthorized: You can only delete events for your own account');
        }
        const params = { accountId, eventId };
        await this.eventsApiService.deleteEvent(params);
        return {
            success: true,
            accountId,
            eventId,
            message: 'Event deleted successfully',
        };
    }
    transformCreateEventInput(input) {
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
    generateEventId() {
        // Generate a unique event ID using timestamp and random component
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 8);
        return `evt_${timestamp}_${random}`;
    }
    mapEventTypeToActionType(eventType) {
        // Map GraphQL eventType to backend maintenance actionType
        const typeMapping = {
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
    convertTimestamps(unitEvent) {
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
    async listEventsByStatus(event) {
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
        const allEvents = [];
        // Fetch events for each unit in parallel (batch by 10 to avoid overwhelming the API)
        const batchSize = 10;
        for (let i = 0; i < units.length; i += batchSize) {
            const unitBatch = units.slice(i, i + batchSize);
            const eventPromises = unitBatch.map(async (unit) => {
                try {
                    const params = {
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
                }
                catch (error) {
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
            filteredEvents = allEvents.filter(event => statusFilter.includes(event.status));
            console.log(`Events after status filter: ${filteredEvents.length}`);
        }
        // Step 4: Sort events by status (alphabetically)
        const statusOrder = [
            types_1.EventStatus.ACKNOWLEDGED,
            types_1.EventStatus.CANCELLED,
            types_1.EventStatus.CLOSED,
            types_1.EventStatus.CREATED,
            types_1.EventStatus.ESCALATED,
            types_1.EventStatus.IN_PROGRESS,
            types_1.EventStatus.ON_HOLD,
            types_1.EventStatus.RESOLVED,
        ];
        filteredEvents.sort((a, b) => {
            const statusIndexA = statusOrder.indexOf(a.status);
            const statusIndexB = statusOrder.indexOf(b.status);
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
            }
            catch (error) {
                console.error('Invalid cursor:', error);
                // Invalid cursor, start from beginning
                startIndex = 0;
            }
        }
        const endIndex = startIndex + limit;
        const paginatedEvents = filteredEvents.slice(startIndex, endIndex);
        // Create next cursor if there are more events
        let nextCursor;
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
exports.EventResolver = EventResolver;
//# sourceMappingURL=event-resolver.js.map