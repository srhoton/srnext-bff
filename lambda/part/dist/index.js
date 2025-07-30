"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const part_resolver_1 = require("./handlers/part-resolver");
const handler = async (event) => {
    console.log('Received event:', JSON.stringify(event, null, 2));
    try {
        const resolver = new part_resolver_1.PartResolver(event);
        const result = await resolver.resolve(event);
        console.log('Resolver result:', JSON.stringify(result, null, 2));
        return result;
    }
    catch (error) {
        console.error('Error in part resolver:', error);
        throw error;
    }
};
exports.handler = handler;
//# sourceMappingURL=index.js.map