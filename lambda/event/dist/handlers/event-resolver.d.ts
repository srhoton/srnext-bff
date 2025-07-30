import { AppSyncEvent, CreateEventInput, UpdateEventInput, EventStatus } from '../types';
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
export declare class EventResolver {
    private readonly eventsApiService;
    private readonly unitsApiService;
    private readonly jwtAccountId;
    constructor(authToken: string, jwtAccountId?: string);
    handleRequest(event: AppSyncEvent): Promise<unknown>;
    private getEvent;
    private listEvents;
    private createEvent;
    private updateEvent;
    private deleteEvent;
    private transformCreateEventInput;
    private generateEventId;
    private mapEventTypeToActionType;
    private convertTimestamps;
    private listEventsByStatus;
}
//# sourceMappingURL=event-resolver.d.ts.map