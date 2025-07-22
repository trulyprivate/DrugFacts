import { ToolDefinition } from '../interfaces/tool.interface';

export const drugInteractionsTool: ToolDefinition = {
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