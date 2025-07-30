import {
  AppSyncEvent,
  GetAccountArguments,
  ListAccountsArguments,
  CreateAccountArguments,
  UpdateAccountArguments,
  DeleteAccountArguments,
  DeleteAccountResponse,
  Account,
  AccountPageResponse,
} from '../types';
import { AccountsApiService } from '../services/accounts-api.service';

export class AccountResolver {
  private readonly accountsApiService: AccountsApiService;
  private readonly accountId: string | undefined;

  constructor(authToken: string, accountId?: string) {
    this.accountsApiService = new AccountsApiService(authToken);
    this.accountId = accountId;
  }

  async handleRequest(event: AppSyncEvent): Promise<unknown> {
    const { fieldName } = event.info;

    console.log(`Handling ${fieldName} request`, {
      arguments: event.arguments,
      identity: event.identity,
    });

    switch (fieldName) {
      case 'getAccount':
        return this.getAccount(event as unknown as AppSyncEvent<GetAccountArguments>);
      case 'listAccounts':
        return this.listAccounts(event as unknown as AppSyncEvent<ListAccountsArguments>);
      case 'createAccount':
        return this.createAccount(event as unknown as AppSyncEvent<CreateAccountArguments>);
      case 'updateAccount':
        return this.updateAccount(event as unknown as AppSyncEvent<UpdateAccountArguments>);
      case 'deleteAccount':
        return this.deleteAccount(event as unknown as AppSyncEvent<DeleteAccountArguments>);
      default:
        throw new Error(`Unknown field: ${fieldName}`);
    }
  }

  private async getAccount(event: AppSyncEvent<GetAccountArguments>): Promise<Account> {
    const { id } = event.arguments;

    // Verify that the requested account ID matches the JWT sub claim
    if (id !== this.accountId) {
      throw new Error('Unauthorized: You can only access your own account');
    }

    const account = await this.accountsApiService.getAccount(id);
    return this.convertTimestamps(account);
  }

  private async listAccounts(_event: AppSyncEvent<ListAccountsArguments>): Promise<AccountPageResponse> {
    // For list operation, we only return the account matching the JWT sub
    // This is different from the API which might return all accounts
    if (!this.accountId) {
      throw new Error('Unauthorized: No account ID found in JWT');
    }

    try {
      const account = await this.accountsApiService.getAccount(this.accountId);
      return {
        items: [this.convertTimestamps(account)],
        hasMore: false,
      };
    } catch (error) {
      // If account not found, return empty list
      if (error instanceof Error && error.message.includes('not found')) {
        return {
          items: [],
          hasMore: false,
        };
      }
      throw error;
    }
  }

  private async createAccount(event: AppSyncEvent<CreateAccountArguments>): Promise<Account> {
    const { input } = event.arguments;

    // If no ID is provided, use the account ID from JWT
    const accountId = input.id || this.accountId;
    
    // Ensure required fields are present
    if (!accountId) {
      throw new Error('Account ID is required');
    }

    const accountData = {
      ...input,
      id: accountId,
    };

    const account = await this.accountsApiService.createAccount(accountData);
    return this.convertTimestamps(account);
  }

  private async updateAccount(event: AppSyncEvent<UpdateAccountArguments>): Promise<Account> {
    const { id, input } = event.arguments;

    // Verify that the account being updated matches the JWT sub claim
    if (id !== this.accountId) {
      throw new Error('Unauthorized: You can only update your own account');
    }

    const account = await this.accountsApiService.updateAccount(id, input);
    return this.convertTimestamps(account);
  }

  private async deleteAccount(event: AppSyncEvent<DeleteAccountArguments>): Promise<DeleteAccountResponse> {
    const { id } = event.arguments;

    // For delete operation, we need to verify ownership
    // Based on requirements, this should match the JWT sub
    if (id !== this.accountId) {
      throw new Error('Unauthorized: You can only delete your own account');
    }

    await this.accountsApiService.deleteAccount(id);

    return {
      success: true,
      id,
      message: 'Account deleted successfully',
    };
  }

  private convertTimestamps(account: Account): any {
    return {
      ...account,
      createdAt: Math.floor(new Date(account.createdAt).getTime() / 1000),
      updatedAt: Math.floor(new Date(account.updatedAt).getTime() / 1000),
    };
  }
}