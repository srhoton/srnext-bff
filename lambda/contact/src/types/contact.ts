export type ContactStatus = 'active' | 'inactive';

export interface Contact {
  accountId: string;
  contactId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  status?: ContactStatus;
  locationIds?: string[];
  config?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface ContactInput {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  status?: ContactStatus;
  locationIds?: string[];
  config?: Record<string, unknown>;
}

export interface ContactUpdate {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  status?: ContactStatus;
  locationIds?: string[];
  config?: Record<string, unknown>;
}

export interface PaginatedContactResponse {
  items: Contact[];
  nextCursor?: string;
  limit: number;
}

export interface ErrorResponse {
  error: string;
  message: string;
  status: number;
  path: string;
  timestamp: string;
  validationErrors?: Record<string, string[]>;
}

