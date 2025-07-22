import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DrugsCacheService } from '../drugs/services/drugs-cache.service';
import { ToolDefinition, ToolCallRequest, ToolCallResponse } from './interfaces/tool.interface';
import { drugSearchTool } from './tools/drug-search.tool';
import { drugDetailsTool } from './tools/drug-details.tool';
import { drugInteractionsTool } from './tools/drug-interactions.tool';

@Injectable()
export class McpService implements OnModuleInit {
  private readonly logger = new Logger(McpService.name);
  private tools: Map<string, ToolDefinition> = new Map();

  constructor(
    private configService: ConfigService,
    private drugsCacheService: DrugsCacheService,
  ) {}

  async onModuleInit() {
    // Register available tools
    this.tools.set('drug_search', drugSearchTool);
    this.tools.set('drug_details', drugDetailsTool);
    this.tools.set('check_drug_interactions', drugInteractionsTool);

    this.logger.log(`MCP Service initialized with ${this.tools.size} tools`);
  }

  async listTools(): Promise<ToolDefinition[]> {
    return Array.from(this.tools.values());
  }

  async callTool(request: ToolCallRequest): Promise<ToolCallResponse> {
    const { name, arguments: args } = request;
    
    if (!this.tools.has(name)) {
      throw new Error(`Unknown tool: ${name}`);
    }

    switch (name) {
      case 'drug_search':
        return this.handleDrugSearch(args);
      case 'drug_details':
        return this.handleDrugDetails(args);
      case 'check_drug_interactions':
        return this.handleDrugInteractions(args);
      default:
        throw new Error(`Tool ${name} not implemented`);
    }
  }

  private async handleDrugSearch(args: any): Promise<ToolCallResponse> {
    try {
      const { query, filters = {} } = args;
      const searchDto = {
        q: query,
        therapeuticClass: filters.therapeuticClass,
        manufacturer: filters.manufacturer,
        limit: filters.limit || 10,
        page: filters.page || 1,
      };

      const result = await this.drugsCacheService.searchDrugs(searchDto);
      
      return {
        content: [{
          type: 'text',
          text: `Found ${result['pagination']?.total || result['data']?.length || 0} drugs matching "${query}"`,
          data: result,
        }],
      };
    } catch (error) {
      this.logger.error('Error in drug search:', error);
      return {
        content: [{
          type: 'text',
          text: `Error searching for drugs: ${error.message}`,
        }],
      };
    }
  }

  private async handleDrugDetails(args: any): Promise<ToolCallResponse> {
    try {
      const { slug } = args;
      
      if (!slug) {
        throw new Error('Drug slug is required');
      }

      const drug = await this.drugsCacheService.getDrugBySlug(slug);
      
      return {
        content: [{
          type: 'text',
          text: `Retrieved details for ${drug.drugName}`,
          data: drug,
        }],
      };
    } catch (error) {
      this.logger.error('Error fetching drug details:', error);
      return {
        content: [{
          type: 'text',
          text: `Error fetching drug details: ${error.message}`,
        }],
      };
    }
  }

  private async handleDrugInteractions(args: any): Promise<ToolCallResponse> {
    try {
      const { drugSlugs } = args;
      
      if (!Array.isArray(drugSlugs) || drugSlugs.length < 2) {
        throw new Error('At least two drug slugs are required for interaction check');
      }

      // Fetch all drugs
      const drugs = await Promise.all(
        drugSlugs.map(slug => this.drugsCacheService.getDrugBySlug(slug))
      );

      // Extract drug interactions information
      const interactions = drugs.map(drug => ({
        drugName: drug.drugName,
        interactions: drug.drugInteractions || 'No interaction information available',
      }));

      return {
        content: [{
          type: 'text',
          text: `Interaction check for ${drugs.map(d => d.drugName).join(', ')}`,
          data: { interactions },
        }],
      };
    } catch (error) {
      this.logger.error('Error checking drug interactions:', error);
      return {
        content: [{
          type: 'text',
          text: `Error checking drug interactions: ${error.message}`,
        }],
      };
    }
  }
}