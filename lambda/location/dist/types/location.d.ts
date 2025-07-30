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
export interface BaseLocation {
    id?: string;
    accountId: string;
    locationType: LocationType;
    extendedAttributes?: Record<string, unknown>;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string;
}
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
export type Location = AddressLocation | CoordinatesLocation;
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
export declare function isAddressLocation(location: Location): location is AddressLocation;
export declare function isCoordinatesLocation(location: Location): location is CoordinatesLocation;
export declare function isCreateAddressLocationInput(input: CreateLocationInput): input is CreateAddressLocationInput;
export declare function isCreateCoordinatesLocationInput(input: CreateLocationInput): input is CreateCoordinatesLocationInput;
//# sourceMappingURL=location.d.ts.map