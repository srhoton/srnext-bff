// Location data structures based on OpenAPI specification

export interface Address {
  streetAddress: string;
  streetAddress2?: string;
  city: string;
  stateProvince?: string;
  postalCode: string;
  country: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
}

export type LocationType = 'address' | 'coordinates';

// Base location interface
export interface BaseLocation {
  id?: string;
  accountId: string;
  locationType: LocationType;
  extendedAttributes?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
}

// Location types with discriminated union
export interface AddressLocation extends BaseLocation {
  locationType: 'address';
  address: Address;
  coordinates?: never;
}

export interface CoordinatesLocation extends BaseLocation {
  locationType: 'coordinates';
  coordinates: Coordinates;
  address?: never;
}

// Union type for all locations
export type Location = AddressLocation | CoordinatesLocation;

// Input types for create operations
export interface CreateAddressLocationInput {
  accountId: string;
  locationType: 'address';
  address: Address;
  extendedAttributes?: Record<string, unknown>;
}

export interface CreateCoordinatesLocationInput {
  accountId: string;
  locationType: 'coordinates';
  coordinates: Coordinates;
  extendedAttributes?: Record<string, unknown>;
}

export type CreateLocationInput = CreateAddressLocationInput | CreateCoordinatesLocationInput;

// Input types for update operations
export interface UpdateAddressLocationInput {
  accountId?: string;
  locationType?: 'address';
  address?: Address;
  extendedAttributes?: Record<string, unknown>;
}

export interface UpdateCoordinatesLocationInput {
  accountId?: string;
  locationType?: 'coordinates';
  coordinates?: Coordinates;
  extendedAttributes?: Record<string, unknown>;
}

export type UpdateLocationInput = UpdateAddressLocationInput | UpdateCoordinatesLocationInput;

// Response types
export interface LocationPageResponse {
  items: Location[];
  nextCursor?: string;
  limit: number;
  count: number;
}

export interface DeleteLocationResponse {
  success: boolean;
  accountId: string;
  locationId: string;
  message?: string;
}

// Parameter types for operations
export interface GetLocationParams {
  accountId: string;
  locationId: string;
}

export interface ListLocationsParams {
  accountId: string;
  cursor?: string;
  limit?: number;
}

export interface CreateLocationParams {
  accountId: string;
}

export interface UpdateLocationParams {
  accountId: string;
  locationId: string;
}

export interface DeleteLocationParams {
  accountId: string;
  locationId: string;
}

// Type guards for runtime type checking
export function isAddressLocation(location: Location): location is AddressLocation {
  return location.locationType === 'address' && 'address' in location;
}

export function isCoordinatesLocation(location: Location): location is CoordinatesLocation {
  return location.locationType === 'coordinates' && 'coordinates' in location;
}

export function isCreateAddressLocationInput(input: CreateLocationInput): input is CreateAddressLocationInput {
  return input.locationType === 'address' && 'address' in input;
}

export function isCreateCoordinatesLocationInput(input: CreateLocationInput): input is CreateCoordinatesLocationInput {
  return input.locationType === 'coordinates' && 'coordinates' in input;
}