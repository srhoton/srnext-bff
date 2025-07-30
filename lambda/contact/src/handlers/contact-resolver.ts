import {
  AppSyncEvent,
  GetContactArguments,
  ListContactsArguments,
  CreateContactArguments,
  UpdateContactArguments,
  DeleteContactArguments,
  Contact,
  PaginatedContactResponse,
} from '../types';
import { ContactsApiService } from '../services/contacts-api.service';

export class ContactResolver {
  private readonly contactsApiService: ContactsApiService;
  private readonly jwtAccountId: string | undefined;

  constructor(authToken: string, jwtAccountId?: string) {
    this.contactsApiService = new ContactsApiService(authToken);
    this.jwtAccountId = jwtAccountId;
  }

  async handleRequest(event: AppSyncEvent): Promise<unknown> {
    const { fieldName } = event.info;

    console.log(`Handling ${fieldName} request`, {
      arguments: event.arguments,
      identity: event.identity,
    });

    switch (fieldName) {
      case 'getContact':
        return this.getContact(event as unknown as AppSyncEvent<GetContactArguments>);
      case 'listContacts':
        return this.listContacts(event as unknown as AppSyncEvent<ListContactsArguments>);
      case 'createContact':
        return this.createContact(event as unknown as AppSyncEvent<CreateContactArguments>);
      case 'updateContact':
        return this.updateContact(event as unknown as AppSyncEvent<UpdateContactArguments>);
      case 'deleteContact':
        return this.deleteContact(event as unknown as AppSyncEvent<DeleteContactArguments>);
      default:
        throw new Error(`Unknown field: ${fieldName}`);
    }
  }

  private async getContact(event: AppSyncEvent<GetContactArguments>): Promise<Contact> {
    const { accountId, email } = event.arguments;

    // Verify that the requested account ID matches the JWT sub claim
    if (accountId !== this.jwtAccountId) {
      throw new Error('Unauthorized: You can only access contacts for your own account');
    }

    const contact = await this.contactsApiService.getContact(accountId, email);
    return this.convertTimestamps(contact);
  }

  private async listContacts(event: AppSyncEvent<ListContactsArguments>): Promise<PaginatedContactResponse> {
    const { accountId, cursor, limit } = event.arguments;

    // Verify that the requested account ID matches the JWT sub claim
    if (accountId !== this.jwtAccountId) {
      throw new Error('Unauthorized: You can only list contacts for your own account');
    }

    const response = await this.contactsApiService.listContacts(accountId, cursor, limit);
    
    return {
      ...response,
      items: response.items.map(contact => this.convertTimestamps(contact)),
    };
  }

  private async createContact(event: AppSyncEvent<CreateContactArguments>): Promise<Contact> {
    const { accountId, input } = event.arguments;

    // For create operation, we allow any accountId as specified in requirements
    // The API will handle validation of the account existence
    const contact = await this.contactsApiService.createContact(accountId, input);
    return this.convertTimestamps(contact);
  }

  private async updateContact(event: AppSyncEvent<UpdateContactArguments>): Promise<Contact> {
    const { accountId, email, input } = event.arguments;

    // Verify that the account being updated matches the JWT sub claim
    if (accountId !== this.jwtAccountId) {
      throw new Error('Unauthorized: You can only update contacts for your own account');
    }

    const contact = await this.contactsApiService.updateContact(accountId, email, input);
    return this.convertTimestamps(contact);
  }

  private async deleteContact(event: AppSyncEvent<DeleteContactArguments>): Promise<Contact> {
    const { accountId, email } = event.arguments;

    // Verify that the account being deleted from matches the JWT sub claim
    if (accountId !== this.jwtAccountId) {
      throw new Error('Unauthorized: You can only delete contacts for your own account');
    }

    const deletedContact = await this.contactsApiService.deleteContact(accountId, email);
    return this.convertTimestamps(deletedContact);
  }

  private convertTimestamps(contact: Contact): any {
    return {
      ...contact,
      createdAt: this.convertTimestampToGraphQL(new Date(contact.createdAt).getTime()),
      updatedAt: this.convertTimestampToGraphQL(new Date(contact.updatedAt).getTime()),
      deletedAt: contact.deletedAt ? this.convertTimestampToGraphQL(new Date(contact.deletedAt).getTime()) : null,
    };
  }

  private convertTimestampToGraphQL(epochMilliseconds: number): number {
    const seconds = Math.floor(epochMilliseconds / 1000);
    
    // AWSTimestamp has a limit based on 32-bit signed integer (max value: 2147483647)
    const maxTimestamp = 2147483647;
    
    if (seconds > maxTimestamp) {
      console.warn(`Timestamp ${seconds} exceeds AWSTimestamp max value. Capping at ${maxTimestamp}`);
      return maxTimestamp;
    }
    
    return seconds;
  }
}