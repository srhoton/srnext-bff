import { AppSyncEvent } from '../types';
export declare class LocationResolver {
    private locationsApiService;
    private jwtAccountId;
    constructor(event: AppSyncEvent);
    private initializeJwtContext;
    private initializeApiService;
    resolve(event: AppSyncEvent): Promise<unknown>;
    private validateAccountAccess;
    private getLocation;
    private listLocations;
    private createLocation;
    private updateLocation;
    private deleteLocation;
}
//# sourceMappingURL=location-resolver.d.ts.map