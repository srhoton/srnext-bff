import { Location, CreateLocationInput, UpdateLocationInput, LocationPageResponse, GetLocationParams, ListLocationsParams, CreateLocationParams, UpdateLocationParams, DeleteLocationParams } from '../types';
export declare class LocationsApiService {
    private readonly httpClient;
    private readonly baseUrl;
    constructor(authToken: string);
    getLocation(params: GetLocationParams): Promise<Location>;
    listLocations(params: ListLocationsParams): Promise<LocationPageResponse>;
    createLocation(params: CreateLocationParams, input: CreateLocationInput): Promise<Location>;
    updateLocation(params: UpdateLocationParams, input: UpdateLocationInput): Promise<Location>;
    deleteLocation(params: DeleteLocationParams): Promise<void>;
    private handleError;
}
//# sourceMappingURL=locations-api.service.d.ts.map