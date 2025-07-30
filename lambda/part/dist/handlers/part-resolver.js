"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartResolver = void 0;
const uuid_1 = require("uuid");
const parts_api_1 = require("../services/parts-api");
class PartResolver {
    constructor(event) {
        const apiUrl = process.env['PARTS_API_URL'] ?? 'https://part-srnext.sb.fullbay.com';
        this.partsApiService = new parts_api_1.PartsApiService(apiUrl);
        this.jwtToken = event.request?.headers?.authorization?.replace('Bearer ', '') ?? undefined;
        this.jwtAccountId = event.identity?.claims?.sub;
    }
    validateAccountAccess(requestedAccountId) {
        if (!this.jwtAccountId) {
            throw new Error('Authentication required: JWT token must be provided');
        }
        if (this.jwtAccountId !== requestedAccountId) {
            throw new Error('Access denied: accountId must match authenticated user');
        }
    }
    parseTimestamp(value) {
        if (!value) {
            return undefined;
        }
        const num = parseInt(value, 10);
        return isNaN(num) ? undefined : num;
    }
    parseJSON(value) {
        if (!value) {
            return undefined;
        }
        try {
            return JSON.parse(value);
        }
        catch {
            console.warn('Failed to parse JSON:', value);
            return undefined;
        }
    }
    transformGraphQLInputToPart(input) {
        const result = {
            partNumber: input.partNumber,
            description: input.description,
            manufacturer: input.manufacturer,
            category: input.category,
            condition: input.condition,
            status: input.status,
            quantity: input.quantity,
        };
        if (input.subcategory !== undefined) {
            result.subcategory = input.subcategory;
        }
        if (input.unitId !== undefined) {
            result.unitId = input.unitId;
        }
        if (input.locationId !== undefined) {
            result.locationId = input.locationId;
        }
        if (input.serialNumber !== undefined) {
            result.serialNumber = input.serialNumber;
        }
        if (input.batchNumber !== undefined) {
            result.batchNumber = input.batchNumber;
        }
        const installDate = this.parseTimestamp(input.installDate);
        if (installDate !== undefined) {
            result.installDate = installDate;
        }
        const purchaseDate = this.parseTimestamp(input.purchaseDate);
        if (purchaseDate !== undefined) {
            result.purchaseDate = purchaseDate;
        }
        const warrantyExpiration = this.parseTimestamp(input.warrantyExpiration);
        if (warrantyExpiration !== undefined) {
            result.warrantyExpiration = warrantyExpiration;
        }
        if (input.vendor !== undefined) {
            result.vendor = input.vendor;
        }
        if (input.weight !== undefined) {
            result.weight = input.weight;
        }
        if (input.dimensions !== undefined) {
            result.dimensions = input.dimensions;
        }
        const specifications = this.parseJSON(input.specifications);
        if (specifications !== undefined) {
            result.specifications = specifications;
        }
        const extendedAttributes = this.parseJSON(input.extendedAttributes);
        if (extendedAttributes !== undefined) {
            result.extendedAttributes = extendedAttributes;
        }
        if (input.tags !== undefined) {
            result.tags = input.tags;
        }
        if (input.notes !== undefined) {
            result.notes = input.notes;
        }
        return result;
    }
    transformGraphQLUpdateInputToPart(input) {
        const update = {};
        if (input.partNumber !== undefined) {
            update.partNumber = input.partNumber;
        }
        if (input.description !== undefined) {
            update.description = input.description;
        }
        if (input.manufacturer !== undefined) {
            update.manufacturer = input.manufacturer;
        }
        if (input.category !== undefined) {
            update.category = input.category;
        }
        if (input.subcategory !== undefined) {
            update.subcategory = input.subcategory;
        }
        if (input.unitId !== undefined) {
            update.unitId = input.unitId;
        }
        if (input.locationId !== undefined) {
            update.locationId = input.locationId;
        }
        if (input.condition !== undefined) {
            update.condition = input.condition;
        }
        if (input.status !== undefined) {
            update.status = input.status;
        }
        if (input.quantity !== undefined) {
            update.quantity = input.quantity;
        }
        if (input.serialNumber !== undefined) {
            update.serialNumber = input.serialNumber;
        }
        if (input.batchNumber !== undefined) {
            update.batchNumber = input.batchNumber;
        }
        if (input.installDate !== undefined) {
            const installDate = this.parseTimestamp(input.installDate);
            if (installDate !== undefined) {
                update.installDate = installDate;
            }
        }
        if (input.purchaseDate !== undefined) {
            const purchaseDate = this.parseTimestamp(input.purchaseDate);
            if (purchaseDate !== undefined) {
                update.purchaseDate = purchaseDate;
            }
        }
        if (input.warrantyExpiration !== undefined) {
            const warrantyExpiration = this.parseTimestamp(input.warrantyExpiration);
            if (warrantyExpiration !== undefined) {
                update.warrantyExpiration = warrantyExpiration;
            }
        }
        if (input.vendor !== undefined) {
            update.vendor = input.vendor;
        }
        if (input.weight !== undefined) {
            update.weight = input.weight;
        }
        if (input.dimensions !== undefined) {
            update.dimensions = input.dimensions;
        }
        if (input.specifications !== undefined) {
            const specifications = this.parseJSON(input.specifications);
            if (specifications !== undefined) {
                update.specifications = specifications;
            }
        }
        if (input.extendedAttributes !== undefined) {
            const extendedAttributes = this.parseJSON(input.extendedAttributes);
            if (extendedAttributes !== undefined) {
                update.extendedAttributes = extendedAttributes;
            }
        }
        if (input.tags !== undefined) {
            update.tags = input.tags;
        }
        if (input.notes !== undefined) {
            update.notes = input.notes;
        }
        return update;
    }
    generateSortKey(locationId, unitId, partId) {
        const actualPartId = partId ?? (0, uuid_1.v4)();
        if (locationId) {
            return `location#${locationId}#${actualPartId}`;
        }
        else if (unitId) {
            return `unit#${unitId}#${actualPartId}`;
        }
        else {
            throw new Error('Either locationId or unitId must be provided');
        }
    }
    extractPartIdFromSortKey(sortKey) {
        const parts = sortKey.split('#');
        if (parts.length !== 3) {
            throw new Error('Invalid sortKey format');
        }
        return parts[2] ?? '';
    }
    async resolve(event) {
        const fieldName = event.info.fieldName;
        console.log(`Resolving ${fieldName}`, JSON.stringify(event.arguments, null, 2));
        try {
            switch (fieldName) {
                case 'getPart':
                    return await this.getPart(event);
                case 'createPart':
                    return await this.createPart(event);
                case 'updatePart':
                    return await this.updatePart(event);
                case 'deletePart':
                    return await this.deletePart(event);
                case 'listParts':
                    return await this.listParts(event);
                default:
                    throw new Error(`Unknown field: ${fieldName}`);
            }
        }
        catch (error) {
            console.error(`Error in ${fieldName}:`, error);
            throw error;
        }
    }
    async getPart(event) {
        const { accountId, partId } = event.arguments;
        this.validateAccountAccess(accountId);
        const parts = await this.partsApiService.listParts(accountId, { limit: 100 }, this.jwtToken);
        const part = parts.data.find(p => {
            const extractedPartId = this.extractPartIdFromSortKey(p.sortKey);
            return extractedPartId === partId;
        });
        if (!part) {
            throw new Error(`Part not found: ${partId}`);
        }
        return part;
    }
    async createPart(event) {
        const { accountId, input } = event.arguments;
        this.validateAccountAccess(accountId);
        const createInput = this.transformGraphQLInputToPart(input);
        const partId = (0, uuid_1.v4)();
        const sortKey = this.generateSortKey(createInput.locationId, createInput.unitId, partId);
        const partInput = {
            partId,
            sortKey,
            ...createInput,
        };
        console.log('Creating part with input:', JSON.stringify(partInput, null, 2));
        const part = await this.partsApiService.createPart(accountId, partInput, this.jwtToken);
        return part;
    }
    async updatePart(event) {
        const { accountId, partId, input } = event.arguments;
        this.validateAccountAccess(accountId);
        const parts = await this.partsApiService.listParts(accountId, { limit: 100 }, this.jwtToken);
        const existingPart = parts.data.find(p => {
            const extractedPartId = this.extractPartIdFromSortKey(p.sortKey);
            return extractedPartId === partId;
        });
        if (!existingPart) {
            throw new Error(`Part not found: ${partId}`);
        }
        const updateInput = this.transformGraphQLUpdateInputToPart(input);
        let newSortKey = existingPart.sortKey;
        if (input.locationId || input.unitId) {
            const locationId = input.locationId ?? existingPart.locationId;
            const unitId = input.unitId ?? existingPart.unitId;
            if (locationId && unitId) {
                throw new Error('Part cannot be associated with both location and unit');
            }
            newSortKey = this.generateSortKey(locationId, unitId, partId);
        }
        console.log('Updating part with input:', JSON.stringify(updateInput, null, 2));
        const part = await this.partsApiService.updatePart(accountId, newSortKey, updateInput, this.jwtToken);
        return part;
    }
    async deletePart(event) {
        const { accountId, partId } = event.arguments;
        this.validateAccountAccess(accountId);
        const parts = await this.partsApiService.listParts(accountId, { limit: 100 }, this.jwtToken);
        const part = parts.data.find(p => {
            const extractedPartId = this.extractPartIdFromSortKey(p.sortKey);
            return extractedPartId === partId;
        });
        if (!part) {
            throw new Error(`Part not found: ${partId}`);
        }
        const success = await this.partsApiService.deletePart(accountId, part.sortKey, this.jwtToken);
        return success;
    }
    async listParts(event) {
        const { accountId, locationId, unitId, limit, cursor } = event.arguments;
        this.validateAccountAccess(accountId);
        const options = {
            limit: limit ?? 20,
        };
        if (locationId !== undefined) {
            options.locationId = locationId;
        }
        if (unitId !== undefined) {
            options.unitId = unitId;
        }
        if (cursor !== undefined) {
            options.cursor = cursor;
        }
        const response = await this.partsApiService.listParts(accountId, options, this.jwtToken);
        const result = {
            items: response.data,
            limit: response.pagination.limit,
            count: response.pagination.count,
        };
        if (response.pagination.nextCursor !== null && response.pagination.nextCursor !== undefined) {
            result.nextCursor = response.pagination.nextCursor;
        }
        return result;
    }
}
exports.PartResolver = PartResolver;
//# sourceMappingURL=part-resolver.js.map