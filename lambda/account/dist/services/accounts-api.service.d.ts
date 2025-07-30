import { Account, AccountCreate, AccountPartialUpdate, AccountPageResponse } from '../types';
export declare class AccountsApiService {
    private readonly client;
    private readonly baseUrl;
    constructor(authToken: string);
    getAccount(accountId: string): Promise<Account>;
    listAccounts(cursor?: string, limit?: number): Promise<AccountPageResponse>;
    createAccount(account: AccountCreate): Promise<Account>;
    updateAccount(accountId: string, updates: AccountPartialUpdate): Promise<Account>;
    deleteAccount(accountId: string): Promise<void>;
    private handleError;
}
//# sourceMappingURL=accounts-api.service.d.ts.map