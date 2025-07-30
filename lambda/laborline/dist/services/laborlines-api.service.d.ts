import { LaborLine, CreateLaborLineInput, UpdateLaborLineInput, LaborLinePageResponse, GetLaborLineParams, ListLaborLinesParams, CreateLaborLineParams, UpdateLaborLineParams, DeleteLaborLineParams } from '../types';
export declare class LaborLinesApiService {
    private readonly httpClient;
    private readonly baseUrl;
    constructor(authToken: string);
    getLaborLine(params: GetLaborLineParams): Promise<LaborLine>;
    listLaborLines(params: ListLaborLinesParams): Promise<LaborLinePageResponse>;
    createLaborLine(params: CreateLaborLineParams, input: CreateLaborLineInput): Promise<LaborLine>;
    updateLaborLine(params: UpdateLaborLineParams, input: UpdateLaborLineInput): Promise<LaborLine>;
    deleteLaborLine(params: DeleteLaborLineParams): Promise<void>;
    private handleError;
}
//# sourceMappingURL=laborlines-api.service.d.ts.map