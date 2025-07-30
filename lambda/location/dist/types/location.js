"use strict";
// Location data structures based on OpenAPI specification
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAddressLocation = isAddressLocation;
exports.isCoordinatesLocation = isCoordinatesLocation;
exports.isCreateAddressLocationInput = isCreateAddressLocationInput;
exports.isCreateCoordinatesLocationInput = isCreateCoordinatesLocationInput;
// Type guards for runtime type checking
function isAddressLocation(location) {
    return location.locationType === 'address' && 'address' in location;
}
function isCoordinatesLocation(location) {
    return location.locationType === 'coordinates' && 'coordinates' in location;
}
function isCreateAddressLocationInput(input) {
    return input.locationType === 'address' && 'address' in input;
}
function isCreateCoordinatesLocationInput(input) {
    return input.locationType === 'coordinates' && 'coordinates' in input;
}
//# sourceMappingURL=location.js.map