export type Condition = 'new' | 'used' | 'refurbished' | 'damaged' | 'unknown';
export type Status = 'available' | 'installed' | 'reserved' | 'maintenance' | 'disposed';

export interface Dimensions {
  length?: number;
  width?: number;
  height?: number;
}

export interface Part {
  accountId: string;
  sortKey: string;
  partId: string;
  partNumber: string;
  description: string;
  manufacturer: string;
  category: string;
  subcategory?: string;
  unitId?: string;
  locationId?: string;
  condition: Condition;
  status: Status;
  quantity: number;
  serialNumber?: string;
  batchNumber?: string;
  installDate?: number;
  purchaseDate?: number;
  warrantyExpiration?: number;
  vendor?: string;
  weight?: number;
  dimensions?: Dimensions;
  specifications?: Record<string, string>;
  extendedAttributes?: Record<string, string | number | boolean | string[]>;
  tags?: string[];
  notes?: string;
  createdAt?: number;
  updatedAt?: number;
  deletedAt?: number;
}

export interface PartCreateInput {
  partId: string;
  sortKey: string;
  partNumber: string;
  description: string;
  manufacturer: string;
  category: string;
  subcategory?: string;
  unitId?: string;
  locationId?: string;
  condition: Condition;
  status: Status;
  quantity: number;
  serialNumber?: string;
  batchNumber?: string;
  installDate?: number;
  purchaseDate?: number;
  warrantyExpiration?: number;
  vendor?: string;
  weight?: number;
  dimensions?: Dimensions;
  specifications?: Record<string, string>;
  extendedAttributes?: Record<string, string | number | boolean | string[]>;
  tags?: string[];
  notes?: string;
}

export interface PartUpdateInput {
  partNumber?: string;
  description?: string;
  manufacturer?: string;
  category?: string;
  subcategory?: string;
  unitId?: string;
  locationId?: string;
  condition?: Condition;
  status?: Status;
  quantity?: number;
  serialNumber?: string;
  batchNumber?: string;
  installDate?: number;
  purchaseDate?: number;
  warrantyExpiration?: number;
  vendor?: string;
  weight?: number;
  dimensions?: Dimensions;
  specifications?: Record<string, string>;
  extendedAttributes?: Record<string, string | number | boolean | string[]>;
  tags?: string[];
  notes?: string;
}

export interface PartListResponse {
  items: Part[];
  nextCursor?: string;
  limit: number;
  count: number;
}

export interface GraphQLPartListResponse {
  items: Part[];
  nextCursor?: string;
  limit: number;
  count: number;
}

export interface GraphQLPartInput {
  partNumber: string;
  description: string;
  manufacturer: string;
  category: string;
  subcategory?: string;
  unitId?: string;
  locationId?: string;
  condition: Condition;
  status: Status;
  quantity: number;
  serialNumber?: string;
  batchNumber?: string;
  installDate?: string;
  purchaseDate?: string;
  warrantyExpiration?: string;
  vendor?: string;
  weight?: number;
  dimensions?: Dimensions;
  specifications?: string;
  extendedAttributes?: string;
  tags?: string[];
  notes?: string;
}

export interface GraphQLPartUpdateInput {
  partNumber?: string;
  description?: string;
  manufacturer?: string;
  category?: string;
  subcategory?: string;
  unitId?: string;
  locationId?: string;
  condition?: Condition;
  status?: Status;
  quantity?: number;
  serialNumber?: string;
  batchNumber?: string;
  installDate?: string;
  purchaseDate?: string;
  warrantyExpiration?: string;
  vendor?: string;
  weight?: number;
  dimensions?: Dimensions;
  specifications?: string;
  extendedAttributes?: string;
  tags?: string[];
  notes?: string;
}