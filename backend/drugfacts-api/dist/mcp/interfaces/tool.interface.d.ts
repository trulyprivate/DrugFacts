export interface ToolDefinition {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: Record<string, any>;
        required?: string[];
    };
}
export interface ToolCallRequest {
    name: string;
    arguments: Record<string, any>;
}
export interface ToolCallResponse {
    content: Array<{
        type: string;
        text?: string;
        data?: any;
    }>;
}
