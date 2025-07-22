"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.drugDetailsTool = void 0;
exports.drugDetailsTool = {
    name: 'drug_details',
    description: 'Get comprehensive information about a specific drug including warnings, usage, dosage, and clinical information',
    inputSchema: {
        type: 'object',
        properties: {
            slug: {
                type: 'string',
                description: 'Drug slug identifier (e.g., "mounjaro-d2d7da5")',
            },
        },
        required: ['slug'],
    },
};
//# sourceMappingURL=drug-details.tool.js.map