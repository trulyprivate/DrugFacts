"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.drugInteractionsTool = void 0;
exports.drugInteractionsTool = {
    name: 'check_drug_interactions',
    description: 'Check potential interactions between multiple drugs',
    inputSchema: {
        type: 'object',
        properties: {
            drugSlugs: {
                type: 'array',
                items: {
                    type: 'string',
                },
                description: 'Array of drug slugs to check for interactions (minimum 2)',
                minItems: 2,
            },
        },
        required: ['drugSlugs'],
    },
};
//# sourceMappingURL=drug-interactions.tool.js.map