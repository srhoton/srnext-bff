import { AppSyncEvent } from '../types';
export declare class AccountResolver {
    private readonly accountsApiService;
    private readonly accountId;
    constructor(authToken: string, accountId?: string);
    handleRequest(event: AppSyncEvent): Promise<unknown>;
    private getAccount;
    private listAccounts;
    private createAccount;
    private updateAccount;
    private deleteAccount;
    private convertTimestamps;
}
//# sourceMappingURL=account-resolver.d.ts.map