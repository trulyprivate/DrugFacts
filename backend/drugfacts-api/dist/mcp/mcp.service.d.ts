import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DrugsCacheService } from '../drugs/services/drugs-cache.service';
import { ToolDefinition, ToolCallRequest, ToolCallResponse } from './interfaces/tool.interface';
export declare class McpService implements OnModuleInit {
    private configService;
    private drugsCacheService;
    private readonly logger;
    private tools;
    constructor(configService: ConfigService, drugsCacheService: DrugsCacheService);
    onModuleInit(): Promise<void>;
    listTools(): Promise<ToolDefinition[]>;
    callTool(request: ToolCallRequest): Promise<ToolCallResponse>;
    private handleDrugSearch;
    private handleDrugDetails;
    private handleDrugInteractions;
}
