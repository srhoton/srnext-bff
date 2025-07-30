import { Part } from './part';
export interface SuccessResponse<T> {
    success: true;
    data: T;
}
export interface ErrorResponse {
    success: false;
    error: {
        message: string;
        timestamp: number;
    };
}
export interface ValidationError {
    field: string;
    message: string;
    rejectedValue?: unknown;
}
export interface ValidationErrorResponse {
    success: false;
    error: {
        message: string;
        timestamp: number;
        validationErrors?: ValidationError[];
    };
}
export interface PaginationInfo {
    limit: number;
    hasNextPage: boolean;
    nextCursor?: string | null;
    count: number;
}
export interface PartListApiResponse {
    success: boolean;
    data: Part[];
    pagination: PaginationInfo;
}
export interface PartApiResponse {
    success: boolean;
    data: Part;
}
export interface DeleteApiResponse {
    success: boolean;
    data?: null;
}
export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse | ValidationErrorResponse;
//# sourceMappingURL=responses.d.ts.map