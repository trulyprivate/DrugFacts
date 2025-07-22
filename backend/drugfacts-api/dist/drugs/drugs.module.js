"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DrugsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const drugs_service_1 = require("./drugs.service");
const drugs_controller_1 = require("./drugs.controller");
const drug_schema_1 = require("./schemas/drug.schema");
let DrugsModule = class DrugsModule {
};
exports.DrugsModule = DrugsModule;
exports.DrugsModule = DrugsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: drug_schema_1.Drug.name, schema: drug_schema_1.DrugSchema }]),
        ],
        controllers: [drugs_controller_1.DrugsController],
        providers: [drugs_service_1.DrugsService],
        exports: [drugs_service_1.DrugsService],
    })
], DrugsModule);
//# sourceMappingURL=drugs.module.js.map