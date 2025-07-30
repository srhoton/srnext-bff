import { AccountResolver } from '../handlers/account-resolver';
import { AccountsApiService } from '../services/accounts-api.service';
import { AppSyncEvent, Account } from '../types';

// Mock the AccountsApiService
jest.mock('../services/accounts-api.service');

describe('AccountResolver', () => {
  let resolver: AccountResolver;
  let mockAccountsApiService: jest.Mocked<AccountsApiService>;
  const mockToken = 'mock-jwt-token';
  const mockAccountId = '123e4567-e89b-12d3-a456-426614174000';

  beforeEach(() => {
    jest.clearAllMocks();
    resolver = new AccountResolver(mockToken, mockAccountId);
    mockAccountsApiService = (resolver as any).accountsApiService;
  });

  describe('getAccount', () => {
    it('should get account when ID matches JWT sub', async () => {
      const mockAccount: Account = {
        id: mockAccountId,
        name: 'Test Account',
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      mockAccountsApiService.getAccount = jest.fn().mockResolvedValue(mockAccount);

      const event: AppSyncEvent = {
        arguments: { id: mockAccountId },
        identity: { sub: mockAccountId, issuer: 'test' },
        source: null,
        request: { headers: {} },
        info: {
          fieldName: 'getAccount',
          parentTypeName: 'Query',
        },
      };

      const result = await resolver.handleRequest(event);
      expect(result).toEqual(mockAccount);
      expect(mockAccountsApiService.getAccount).toHaveBeenCalledWith(mockAccountId);
    });

    it('should throw error when ID does not match JWT sub', async () => {
      const event: AppSyncEvent = {
        arguments: { id: 'different-id' },
        identity: { sub: mockAccountId, issuer: 'test' },
        source: null,
        request: { headers: {} },
        info: {
          fieldName: 'getAccount',
          parentTypeName: 'Query',
        },
      };

      await expect(resolver.handleRequest(event)).rejects.toThrow(
        'Unauthorized: You can only access your own account'
      );
    });
  });

  describe('createAccount', () => {
    it('should create account with provided ID', async () => {
      const mockAccount: Account = {
        id: mockAccountId,
        name: 'New Account',
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      mockAccountsApiService.createAccount = jest.fn().mockResolvedValue(mockAccount);

      const event: AppSyncEvent = {
        arguments: {
          input: {
            id: mockAccountId,
            name: 'New Account',
            status: 'active',
          },
        },
        identity: { sub: mockAccountId, issuer: 'test' },
        source: null,
        request: { headers: {} },
        info: {
          fieldName: 'createAccount',
          parentTypeName: 'Mutation',
        },
      };

      const result = await resolver.handleRequest(event);
      expect(result).toEqual(mockAccount);
    });

    it('should use JWT sub as ID when not provided', async () => {
      const mockAccount: Account = {
        id: mockAccountId,
        name: 'New Account',
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      mockAccountsApiService.createAccount = jest.fn().mockResolvedValue(mockAccount);

      const event: AppSyncEvent = {
        arguments: {
          input: {
            name: 'New Account',
            status: 'active',
          },
        },
        identity: { sub: mockAccountId, issuer: 'test' },
        source: null,
        request: { headers: {} },
        info: {
          fieldName: 'createAccount',
          parentTypeName: 'Mutation',
        },
      };

      const result = await resolver.handleRequest(event);
      expect(result).toEqual(mockAccount);
      expect(mockAccountsApiService.createAccount).toHaveBeenCalledWith({
        id: mockAccountId,
        name: 'New Account',
        status: 'active',
      });
    });
  });

  describe('updateAccount', () => {
    it('should update account when ID matches JWT sub', async () => {
      const mockAccount: Account = {
        id: mockAccountId,
        name: 'Updated Account',
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      };

      mockAccountsApiService.updateAccount = jest.fn().mockResolvedValue(mockAccount);

      const event: AppSyncEvent = {
        arguments: {
          id: mockAccountId,
          input: {
            name: 'Updated Account',
          },
        },
        identity: { sub: mockAccountId, issuer: 'test' },
        source: null,
        request: { headers: {} },
        info: {
          fieldName: 'updateAccount',
          parentTypeName: 'Mutation',
        },
      };

      const result = await resolver.handleRequest(event);
      expect(result).toEqual(mockAccount);
    });

    it('should throw error when ID does not match JWT sub', async () => {
      const event: AppSyncEvent = {
        arguments: {
          id: 'different-id',
          input: {
            name: 'Updated Account',
          },
        },
        identity: { sub: mockAccountId, issuer: 'test' },
        source: null,
        request: { headers: {} },
        info: {
          fieldName: 'updateAccount',
          parentTypeName: 'Mutation',
        },
      };

      await expect(resolver.handleRequest(event)).rejects.toThrow(
        'Unauthorized: You can only update your own account'
      );
    });
  });

  describe('deleteAccount', () => {
    it('should delete account when ID matches JWT sub', async () => {
      mockAccountsApiService.deleteAccount = jest.fn().mockResolvedValue(undefined);

      const event: AppSyncEvent = {
        arguments: { id: mockAccountId },
        identity: { sub: mockAccountId, issuer: 'test' },
        source: null,
        request: { headers: {} },
        info: {
          fieldName: 'deleteAccount',
          parentTypeName: 'Mutation',
        },
      };

      const result = await resolver.handleRequest(event);
      expect(result).toEqual({
        success: true,
        id: mockAccountId,
        message: 'Account deleted successfully',
      });
    });

    it('should throw error when ID does not match JWT sub', async () => {
      const event: AppSyncEvent = {
        arguments: { id: 'different-id' },
        identity: { sub: mockAccountId, issuer: 'test' },
        source: null,
        request: { headers: {} },
        info: {
          fieldName: 'deleteAccount',
          parentTypeName: 'Mutation',
        },
      };

      await expect(resolver.handleRequest(event)).rejects.toThrow(
        'Unauthorized: You can only delete your own account'
      );
    });
  });

  describe('listAccounts', () => {
    it('should return only the account matching JWT sub', async () => {
      const mockAccount: Account = {
        id: mockAccountId,
        name: 'Test Account',
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      mockAccountsApiService.getAccount = jest.fn().mockResolvedValue(mockAccount);

      const event: AppSyncEvent = {
        arguments: {},
        identity: { sub: mockAccountId, issuer: 'test' },
        source: null,
        request: { headers: {} },
        info: {
          fieldName: 'listAccounts',
          parentTypeName: 'Query',
        },
      };

      const result = await resolver.handleRequest(event);
      expect(result).toEqual({
        items: [mockAccount],
        hasMore: false,
      });
    });

    it('should return empty list when account not found', async () => {
      mockAccountsApiService.getAccount = jest
        .fn()
        .mockRejectedValue(new Error('Account not found'));

      const event: AppSyncEvent = {
        arguments: {},
        identity: { sub: mockAccountId, issuer: 'test' },
        source: null,
        request: { headers: {} },
        info: {
          fieldName: 'listAccounts',
          parentTypeName: 'Query',
        },
      };

      const result = await resolver.handleRequest(event);
      expect(result).toEqual({
        items: [],
        hasMore: false,
      });
    });
  });
});