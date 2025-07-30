export interface LaborLine {
    laborLineId: string;
    accountId: string;
    taskId: string;
    partId?: string[];
    notes?: string[];
    description?: string;
}
export interface CreateLaborLineInput {
    laborLineId?: string;
    taskId: string;
    partId?: string[];
    notes?: string[];
    description?: string;
}
export interface UpdateLaborLineInput {
    taskId?: string;
    partId?: string[];
    notes?: string[];
    description?: string;
}
export interface LaborLinePageResponse {
    items: LaborLine[];
    nextCursor?: string;
    hasMore: boolean;
}
export interface DeleteLaborLineResponse {
    success: boolean;
    accountId: string;
    laborLineId: string;
    message?: string;
}
export interface GetLaborLineParams {
    accountId: string;
    laborLineId: string;
}
export interface ListLaborLinesParams {
    accountId: string;
    taskId?: string;
    cursor?: string;
    limit?: number;
}
export interface CreateLaborLineParams {
    accountId: string;
}
export interface UpdateLaborLineParams {
    accountId: string;
    laborLineId: string;
}
export interface DeleteLaborLineParams {
    accountId: string;
    laborLineId: string;
}
//# sourceMappingURL=laborline.d.ts.map