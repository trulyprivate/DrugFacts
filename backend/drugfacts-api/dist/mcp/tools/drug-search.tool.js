"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.drugSearchTool = void 0;
exports.drugSearchTool = {
    name: 'drug_search',
    description: 'Search for drugs by name, generic name, active ingredient, or therapeutic class',
    inputSchema: {
        type: 'object',
        properties: {
            query: {
                type: 'string',
                description: 'Search query for drug name, generic name, or active ingredient',
            },
            filters: {
                type: 'object',
                properties: {
                    therapeuticClass: {
                        type: 'string',
                        description: 'Filter by therapeutic class',
                    },
                    manufacturer: {
                        type: 'string',
                        description: 'Filter by manufacturer',
                    },
                    limit: {
                        type: 'number',
                        description: 'Maximum number of results to return',
                        default: 10,
                        minimum: 1,
                        maximum: 100,
                    },
                    page: {
                        type: 'number',
                        description: 'Page number for pagination',
                        default: 1,
                        minimum: 1,
                    },
                },
            },
        },
        required: ['query'],
    },
};
//# sourceMappingURL=drug-search.tool.js.map