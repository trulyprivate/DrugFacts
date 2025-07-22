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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DrugsController = void 0;
const common_1 = require("@nestjs/common");
const drugs_service_1 = require("./drugs.service");
const drugs_cache_service_1 = require("./services/drugs-cache.service");
const cached_drugs_service_1 = require("./cached-drugs.service");
const search_drugs_dto_1 = require("./dto/search-drugs.dto");
let DrugsController = class DrugsController {
    drugsService;
    drugsCacheService;
    cachedDrugsService;
    constructor(drugsService, drugsCacheService, cachedDrugsService) {
        this.drugsService = drugsService;
        this.drugsCacheService = drugsCacheService;
        this.cachedDrugsService = cachedDrugsService;
    }
    async findAll(searchDto) {
        return this.cachedDrugsService.findAll(searchDto);
    }
    async getIndexFormat() {
        const drugs = await this.cachedDrugsService.getAllDrugsIndexFormat();
        return drugs;
    }
    async getTherapeuticClasses() {
        const classes = await this.cachedDrugsService.getTherapeuticClasses();
        return { data: classes };
    }
    async getManufacturers() {
        const manufacturers = await this.cachedDrugsService.getManufacturers();
        return { data: manufacturers };
    }
    async count() {
        const count = await this.cachedDrugsService.count();
        return { count };
    }
    async getCacheStats() {
        const stats = await this.cachedDrugsService.getCacheStats();
        return { data: stats };
    }
    async warmupCache() {
        await this.cachedDrugsService.warmupCache();
        return { message: 'Cache warmup initiated' };
    }
    async invalidateDrug(slug) {
        await this.cachedDrugsService.invalidateDrug(slug);
        return { message: `Cache invalidated for drug: ${slug}` };
    }
    async findBySlug(slug) {
        const drug = await this.cachedDrugsService.findBySlug(slug);
        return { data: drug };
    }
};
exports.DrugsController = DrugsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)(new common_1.ValidationPipe({ transform: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [search_drugs_dto_1.SearchDrugsDto]),
    __metadata("design:returntype", Promise)
], DrugsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('index'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DrugsController.prototype, "getIndexFormat", null);
__decorate([
    (0, common_1.Get)('therapeutic-classes'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DrugsController.prototype, "getTherapeuticClasses", null);
__decorate([
    (0, common_1.Get)('manufacturers'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DrugsController.prototype, "getManufacturers", null);
__decorate([
    (0, common_1.Get)('count'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DrugsController.prototype, "count", null);
__decorate([
    (0, common_1.Get)('cache/stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DrugsController.prototype, "getCacheStats", null);
__decorate([
    (0, common_1.Post)('cache/warmup'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DrugsController.prototype, "warmupCache", null);
__decorate([
    (0, common_1.Post)('cache/invalidate/:slug'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DrugsController.prototype, "invalidateDrug", null);
__decorate([
    (0, common_1.Get)(':slug'),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DrugsController.prototype, "findBySlug", null);
exports.DrugsController = DrugsController = __decorate([
    (0, common_1.Controller)('drugs'),
    (0, common_1.UseInterceptors)(common_1.ClassSerializerInterceptor),
    __metadata("design:paramtypes", [drugs_service_1.DrugsService,
        drugs_cache_service_1.DrugsCacheService,
        cached_drugs_service_1.CachedDrugsService])
], DrugsController);
//# sourceMappingURL=drugs.controller.js.map