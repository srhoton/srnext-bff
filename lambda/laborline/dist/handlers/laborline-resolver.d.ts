import { AppSyncEvent } from '../types';
export declare class LaborLineResolver {
    private jwtAccountId;
    private laborLinesApiService;
    constructor(authToken?: string);
    private extractJwtAccountId;
    private validateAccountAccess;
    private ensureApiService;
    handleRequest(event: AppSyncEvent): Promise<unknown>;
    private getLaborLine;
    private listLaborLines;
    private createLaborLine;
    private updateLaborLine;
    private deleteLaborLine;
}
//# sourceMappingURL=laborline-resolver.d.ts.map