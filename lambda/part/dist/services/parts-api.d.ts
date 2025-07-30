import { Part, PartCreateInput, PartUpdateInput } from '../types/part';
import { PartListApiResponse } from '../types/responses';
export declare class PartsApiService {
    private readonly apiClient;
    constructor(baseUrl: string);
    private handleApiError;
    listParts(accountId: string, options?: {
        locationId?: string;
        unitId?: string;
        limit?: number;
        cursor?: string;
    }, jwtToken?: string): Promise<PartListApiResponse>;
    getPart(accountId: string, sortKey: string, jwtToken?: string): Promise<Part>;
    createPart(accountId: string, input: PartCreateInput, jwtToken?: string): Promise<Part>;
    updatePart(accountId: string, sortKey: string, input: PartUpdateInput, jwtToken?: string): Promise<Part>;
    deletePart(accountId: string, sortKey: string, jwtToken?: string): Promise<boolean>;
}
//# sourceMappingURL=parts-api.d.ts.map