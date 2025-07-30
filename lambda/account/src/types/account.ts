export type AccountStatus = 'active' | 'suspended' | 'pending';

export interface ExtendedAttribute {
  name: string;
  value: string;
}

export interface Account {
  id: string;
  name: string;
  status: AccountStatus;
  createdAt: string;
  updatedAt: string;
  billingContactId?: string;
  billingLocationId?: string;
  extendedAttributes?: ExtendedAttribute[];
}

export interface AccountCreate {
  id?: string;
  name: string;
  status: AccountStatus;
  billingContactId?: string;
  billingLocationId?: string;
  extendedAttributes?: ExtendedAttribute[];
}

export interface AccountUpdate {
  id: string;
  name: string;
  status: AccountStatus;
  billingContactId?: string;
  billingLocationId?: string;
  extendedAttributes?: ExtendedAttribute[];
}

export interface AccountPartialUpdate {
  name?: string;
  status?: AccountStatus;
  billingContactId?: string | null;
  billingLocationId?: string | null;
  extendedAttributes?: ExtendedAttribute[];
}

export interface AccountPageResponse {
  items: Account[];
  nextCursor?: string;
  hasMore: boolean;
}

export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
  path: string;
}

export interface ValidationError {
  field: string;
  message: string;
  rejectedValue?: unknown;
}

export interface ValidationErrorResponse extends ErrorResponse {
  validationErrors?: ValidationError[];
}