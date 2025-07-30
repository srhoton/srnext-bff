import { Task, TaskCreateRequest, TaskUpdateRequest, PaginatedTaskResponse } from '../types';
export declare class TasksApiService {
    private readonly client;
    constructor(apiUrl: string);
    private handleApiError;
    getTask(accountId: string, taskId: string, authToken?: string): Promise<Task>;
    createTask(accountId: string, task: TaskCreateRequest, authToken?: string): Promise<Task>;
    updateTask(accountId: string, taskId: string, updates: TaskUpdateRequest, authToken?: string): Promise<Task>;
    deleteTask(accountId: string, taskId: string, authToken?: string): Promise<boolean>;
    listTasks(accountId: string, options?: {
        limit?: number;
        cursor?: string;
    }, authToken?: string): Promise<PaginatedTaskResponse>;
}
//# sourceMappingURL=tasks-api.d.ts.map