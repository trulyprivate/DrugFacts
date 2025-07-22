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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DrugSchema = exports.Drug = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let Drug = class Drug {
    drugName;
    genericName;
    activeIngredient;
    slug;
    setId;
    labeler;
    manufacturer;
    therapeuticClass;
    dea;
    label;
    boxedWarning;
    warnings;
    precautions;
    adverseReactions;
    drugInteractions;
    contraindications;
    indicationsAndUsage;
    dosageAndAdministration;
    overdosage;
    description;
    clinicalPharmacology;
    nonClinicalToxicology;
    clinicalStudies;
    howSupplied;
    patientCounseling;
    principalDisplayPanel;
    spl;
    aiClassification;
    aiProcessingMetadata;
    createdAt;
    updatedAt;
    _hash;
};
exports.Drug = Drug;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Drug.prototype, "drugName", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Drug.prototype, "genericName", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Drug.prototype, "activeIngredient", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], Drug.prototype, "slug", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Drug.prototype, "setId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Drug.prototype, "labeler", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Drug.prototype, "manufacturer", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Drug.prototype, "therapeuticClass", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Drug.prototype, "dea", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], Drug.prototype, "label", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Drug.prototype, "boxedWarning", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Drug.prototype, "warnings", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Drug.prototype, "precautions", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Drug.prototype, "adverseReactions", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Drug.prototype, "drugInteractions", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Drug.prototype, "contraindications", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Drug.prototype, "indicationsAndUsage", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Drug.prototype, "dosageAndAdministration", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Drug.prototype, "overdosage", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Drug.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Drug.prototype, "clinicalPharmacology", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Drug.prototype, "nonClinicalToxicology", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Drug.prototype, "clinicalStudies", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Drug.prototype, "howSupplied", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Drug.prototype, "patientCounseling", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Drug.prototype, "principalDisplayPanel", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Drug.prototype, "spl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], Drug.prototype, "aiClassification", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], Drug.prototype, "aiProcessingMetadata", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: Date.now }),
    __metadata("design:type", Date)
], Drug.prototype, "createdAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: Date.now }),
    __metadata("design:type", Date)
], Drug.prototype, "updatedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Drug.prototype, "_hash", void 0);
exports.Drug = Drug = __decorate([
    (0, mongoose_1.Schema)({ collection: 'drugs' })
], Drug);
exports.DrugSchema = mongoose_1.SchemaFactory.createForClass(Drug);
//# sourceMappingURL=drug.schema.js.map