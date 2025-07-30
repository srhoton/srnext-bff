import { AppSyncEvent } from '../types';
export declare class PartResolver {
    private readonly partsApiService;
    private readonly jwtToken;
    private readonly jwtAccountId;
    constructor(event: AppSyncEvent);
    private validateAccountAccess;
    private parseTimestamp;
    private parseJSON;
    private transformGraphQLInputToPart;
    private transformGraphQLUpdateInputToPart;
    private generateSortKey;
    private extractPartIdFromSortKey;
    resolve(event: AppSyncEvent): Promise<unknown>;
    private getPart;
    private createPart;
    private updatePart;
    private deletePart;
    private listParts;
}
//# sourceMappingURL=part-resolver.d.ts.map