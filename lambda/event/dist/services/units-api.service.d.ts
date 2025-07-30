export interface Unit {
    id: string;
    accountId: string;
    locationId: string;
    unitType?: string;
    suggestedVin: string;
    errorCode?: string;
    possibleValues?: string;
    additionalErrorText?: string | null;
    errorText?: string;
    vehicleDescriptor?: string;
    destinationMarket?: string | null;
    make?: string;
    manufacturerName?: string;
    model?: string;
    modelYear?: string;
    plantCity?: string;
    series?: string;
    trim?: string | null;
    vehicleType?: string;
    plantCountry?: string;
    plantCompanyName?: string;
    plantState?: string;
    trim2?: string;
    series2?: string;
    note?: string;
    basePrice?: string;
    nonLandUse?: string;
    bodyClass?: string;
    doors?: string;
    windows?: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string;
    extendedAttributes?: Array<{
        attributeName: string;
        attributeValue: string;
    }>;
    acesAttributes?: Array<{
        attributeName: string;
        attributeValue: string;
        attributeKey: string;
    }>;
}
export interface PaginatedUnitsResponse {
    items: Unit[];
    cursor?: string;
    hasMore?: boolean;
}
export interface ErrorResponse {
    error: string;
    message: string;
    path?: string;
}
export declare class UnitsApiService {
    private readonly client;
    private readonly baseUrl;
    constructor(authToken: string);
    listUnits(accountId: string, cursor?: string, limit?: number): Promise<PaginatedUnitsResponse>;
    getAllUnits(accountId: string): Promise<Unit[]>;
    private handleError;
}
//# sourceMappingURL=units-api.service.d.ts.map