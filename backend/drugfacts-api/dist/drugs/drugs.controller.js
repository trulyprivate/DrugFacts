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
const search_drugs_dto_1 = require("./dto/search-drugs.dto");
let DrugsController = class DrugsController {
    drugsService;
    constructor(drugsService) {
        this.drugsService = drugsService;
    }
    async findAll(searchDto) {
        return this.drugsService.findAll(searchDto);
    }
    async getIndexFormat() {
        const drugs = await this.drugsService.getAllDrugsIndexFormat();
        return drugs;
    }
    async getTherapeuticClasses() {
        const classes = await this.drugsService.getTherapeuticClasses();
        return { data: classes };
    }
    async getManufacturers() {
        const manufacturers = await this.drugsService.getManufacturers();
        return { data: manufacturers };
    }
    async count() {
        const count = await this.drugsService.count();
        return { count };
    }
    async findBySlug(slug) {
        const drug = await this.drugsService.findBySlug(slug);
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
    (0, common_1.Get)(':slug'),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DrugsController.prototype, "findBySlug", null);
exports.DrugsController = DrugsController = __decorate([
    (0, common_1.Controller)('api/drugs'),
    (0, common_1.UseInterceptors)(common_1.ClassSerializerInterceptor),
    __metadata("design:paramtypes", [drugs_service_1.DrugsService])
], DrugsController);
//# sourceMappingURL=drugs.controller.js.map