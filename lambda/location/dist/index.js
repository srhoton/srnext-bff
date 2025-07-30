"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const location_resolver_1 = require("./handlers/location-resolver");
const handler = async (event) => {
    console.log('Location Lambda invoked with event:', JSON.stringify(event, null, 2));
    try {
        const resolver = new location_resolver_1.LocationResolver(event);
        const result = await resolver.resolve(event);
        console.log('Location operation completed successfully');
        return result;
    }
    catch (error) {
        console.error('Location Lambda error:', error);
        // Re-throw the error to let AppSync handle it
        throw error;
    }
};
exports.handler = handler;
//# sourceMappingURL=index.js.map