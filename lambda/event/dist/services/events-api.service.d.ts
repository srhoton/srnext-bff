import { UnitEvent, CreateEventInput, UpdateEventInput, ListEventsParams, GetEventParams, UpdateEventParams, DeleteEventParams, PagedEventResponse } from '../types';
export declare class EventsApiService {
    private readonly client;
    private readonly baseUrl;
    constructor(authToken: string);
    createEvent(input: CreateEventInput): Promise<UnitEvent>;
    getEvent(params: GetEventParams): Promise<UnitEvent>;
    listEvents(params: ListEventsParams): Promise<PagedEventResponse>;
    updateEvent(params: UpdateEventParams, input: UpdateEventInput): Promise<UnitEvent>;
    deleteEvent(params: DeleteEventParams): Promise<void>;
    private handleError;
}
//# sourceMappingURL=events-api.service.d.ts.map