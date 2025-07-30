"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const task_resolver_1 = require("./handlers/task-resolver");
const handler = async (event) => {
    console.log('Received event:', JSON.stringify(event, null, 2));
    try {
        const resolver = new task_resolver_1.TaskResolver(event);
        const result = await resolver.resolve(event);
        console.log('Returning result:', JSON.stringify(result, null, 2));
        return result;
    }
    catch (error) {
        console.error('Error in task resolver:', error);
        throw error;
    }
};
exports.handler = handler;
//# sourceMappingURL=index.js.map