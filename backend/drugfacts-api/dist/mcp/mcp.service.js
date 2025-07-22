"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var McpService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.McpService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const drugs_cache_service_1 = require("../drugs/services/drugs-cache.service");
const drug_search_tool_1 = require("./tools/drug-search.tool");
const drug_details_tool_1 = require("./tools/drug-details.tool");
const drug_interactions_tool_1 = require("./tools/drug-interactions.tool");
let McpService = McpService_1 = class McpService {
    configService;
    drugsCacheService;
    logger = new common_1.Logger(McpService_1.name);
    tools = new Map();
    constructor(configService, drugsCacheService) {
        this.configService = configService;
        this.drugsCacheService = drugsCacheService;
    }
    async onModuleInit() {
        this.tools.set('drug_search', drug_search_tool_1.drugSearchTool);
        this.tools.set('drug_details', drug_details_tool_1.drugDetailsTool);
        this.tools.set('check_drug_interactions', drug_interactions_tool_1.drugInteractionsTool);
        this.logger.log(`MCP Service initialized with ${this.tools.size} tools`);
    }
    async listTools() {
        return Array.from(this.tools.values());
    }
    async callTool(request) {
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
    async handleDrugSearch(args) {
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
        }
        catch (error) {
            this.logger.error('Error in drug search:', error);
            return {
                content: [{
                        type: 'text',
                        text: `Error searching for drugs: ${error.message}`,
                    }],
            };
        }
    }
    async handleDrugDetails(args) {
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
        }
        catch (error) {
            this.logger.error('Error fetching drug details:', error);
            return {
                content: [{
                        type: 'text',
                        text: `Error fetching drug details: ${error.message}`,
                    }],
            };
        }
    }
    async handleDrugInteractions(args) {
        try {
            const { drugSlugs } = args;
            if (!Array.isArray(drugSlugs) || drugSlugs.length < 2) {
                throw new Error('At least two drug slugs are required for interaction check');
            }
            const drugs = await Promise.all(drugSlugs.map(slug => this.drugsCacheService.getDrugBySlug(slug)));
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
        }
        catch (error) {
            this.logger.error('Error checking drug interactions:', error);
            return {
                content: [{
                        type: 'text',
                        text: `Error checking drug interactions: ${error.message}`,
                    }],
            };
        }
    }
};
exports.McpService = McpService;
exports.McpService = McpService = McpService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        drugs_cache_service_1.DrugsCacheService])
], McpService);
//# sourceMappingURL=mcp.service.js.map