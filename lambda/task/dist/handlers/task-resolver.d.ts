import { AppSyncEvent } from '../types';
export declare class TaskResolver {
    private readonly tasksApiService;
    private readonly jwtToken;
    private readonly jwtAccountId;
    constructor(event: AppSyncEvent);
    private validateAccountAccess;
    private convertTimestampToGraphQL;
    private convertTimestampFromGraphQL;
    private taskToGraphQL;
    private transformGraphQLInputToTask;
    private transformGraphQLUpdateInputToTask;
    resolve(event: AppSyncEvent): Promise<unknown>;
    private getTask;
    private createTask;
    private updateTask;
    private deleteTask;
    private listTasks;
}
//# sourceMappingURL=task-resolver.d.ts.map