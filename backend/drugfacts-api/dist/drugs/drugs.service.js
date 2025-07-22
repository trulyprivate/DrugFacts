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
var DrugsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DrugsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const drug_schema_1 = require("./schemas/drug.schema");
const search_drugs_dto_1 = require("./dto/search-drugs.dto");
let DrugsService = DrugsService_1 = class DrugsService {
    drugModel;
    logger = new common_1.Logger(DrugsService_1.name);
    constructor(drugModel) {
        this.drugModel = drugModel;
    }
    async onModuleInit() {
        await this.createIndexes();
    }
    async createIndexes() {
        try {
            await this.drugModel.collection.createIndex({
                drugName: 'text',
                genericName: 'text',
                activeIngredient: 'text',
                indicationsAndUsage: 'text',
                'label.indicationsAndUsage': 'text',
                'label.genericName': 'text',
                'label.description': 'text',
                therapeuticClass: 'text',
                manufacturer: 'text',
            }, {
                weights: {
                    drugName: 10,
                    genericName: 8,
                    'label.genericName': 8,
                    activeIngredient: 6,
                    indicationsAndUsage: 4,
                    'label.indicationsAndUsage': 4,
                    'label.description': 3,
                    therapeuticClass: 2,
                    manufacturer: 2,
                },
                name: 'drug_text_search',
                background: true,
            });
            await this.drugModel.collection.createIndex({ drugName: 1, therapeuticClass: 1 }, { name: 'drug_name_class', background: true });
            await this.drugModel.collection.createIndex({ slug: 1 }, { unique: true, name: 'slug_unique', background: true });
            await this.drugModel.collection.createIndex({ therapeuticClass: 1 }, { name: 'therapeutic_class', background: true });
            await this.drugModel.collection.createIndex({ manufacturer: 1 }, { name: 'manufacturer', background: true });
            this.logger.log('Database indexes created successfully');
        }
        catch (error) {
            this.logger.error('Error creating indexes:', error);
        }
    }
    async findAll(searchDto) {
        const { q, therapeuticClass, manufacturer, page = 1, limit = 50, searchType = search_drugs_dto_1.SearchType.WEIGHTED } = searchDto;
        const skip = (page - 1) * limit;
        if (q) {
            switch (searchType) {
                case search_drugs_dto_1.SearchType.TEXT:
                    return this.performTextSearch(q, { therapeuticClass, manufacturer, page, limit });
                case search_drugs_dto_1.SearchType.WEIGHTED:
                    return this.performWeightedSearch(q, { therapeuticClass, manufacturer, page, limit, skip });
                case search_drugs_dto_1.SearchType.STANDARD:
                default:
                    break;
            }
        }
        const query = {};
        if (q && searchType === search_drugs_dto_1.SearchType.STANDARD) {
            query.$or = [
                { drugName: { $regex: q, $options: 'i' } },
                { genericName: { $regex: q, $options: 'i' } },
                { activeIngredient: { $regex: q, $options: 'i' } },
                { manufacturer: { $regex: q, $options: 'i' } },
                { therapeuticClass: { $regex: q, $options: 'i' } },
                { indicationsAndUsage: { $regex: q, $options: 'i' } },
                { 'label.indicationsAndUsage': { $regex: q, $options: 'i' } },
                { 'label.genericName': { $regex: q, $options: 'i' } },
            ];
        }
        if (therapeuticClass) {
            query.therapeuticClass = { $regex: therapeuticClass, $options: 'i' };
        }
        if (manufacturer) {
            query.manufacturer = { $regex: manufacturer, $options: 'i' };
        }
        const [drugs, total] = await Promise.all([
            this.drugModel
                .find(query)
                .select('-_id -__v -_hash')
                .skip(skip)
                .limit(limit)
                .lean()
                .exec(),
            this.drugModel.countDocuments(query),
        ]);
        const totalPages = Math.ceil(total / limit);
        return {
            data: drugs,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            },
        };
    }
    async performWeightedSearch(query, filters) {
        const { therapeuticClass, manufacturer, page, limit, skip } = filters;
        const pipeline = [];
        const matchStage = {};
        if (therapeuticClass) {
            matchStage.therapeuticClass = { $regex: therapeuticClass, $options: 'i' };
        }
        if (manufacturer) {
            matchStage.manufacturer = { $regex: manufacturer, $options: 'i' };
        }
        if (Object.keys(matchStage).length > 0) {
            pipeline.push({ $match: matchStage });
        }
        const searchPattern = query.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        pipeline.push({
            $addFields: {
                searchScore: {
                    $add: [
                        {
                            $cond: [
                                { $eq: [{ $toLower: '$drugName' }, query.toLowerCase()] },
                                10,
                                0,
                            ],
                        },
                        {
                            $cond: [
                                {
                                    $and: [
                                        { $ne: ['$drugName', null] },
                                        {
                                            $regexMatch: {
                                                input: { $toLower: { $ifNull: ['$drugName', ''] } },
                                                regex: searchPattern,
                                                options: 'i',
                                            },
                                        },
                                    ],
                                },
                                8,
                                0,
                            ],
                        },
                        {
                            $cond: [
                                {
                                    $and: [
                                        { $ne: ['$genericName', null] },
                                        {
                                            $regexMatch: {
                                                input: { $toLower: { $ifNull: ['$genericName', ''] } },
                                                regex: searchPattern,
                                                options: 'i',
                                            },
                                        },
                                    ],
                                },
                                6,
                                0,
                            ],
                        },
                        {
                            $cond: [
                                {
                                    $and: [
                                        { $ne: ['$activeIngredient', null] },
                                        {
                                            $regexMatch: {
                                                input: { $toLower: { $ifNull: ['$activeIngredient', ''] } },
                                                regex: searchPattern,
                                                options: 'i',
                                            },
                                        },
                                    ],
                                },
                                5,
                                0,
                            ],
                        },
                        {
                            $cond: [
                                {
                                    $or: [
                                        {
                                            $and: [
                                                { $ne: ['$indicationsAndUsage', null] },
                                                {
                                                    $regexMatch: {
                                                        input: { $toLower: { $ifNull: ['$indicationsAndUsage', ''] } },
                                                        regex: searchPattern,
                                                        options: 'i',
                                                    },
                                                },
                                            ],
                                        },
                                        {
                                            $and: [
                                                { $ne: ['$label.indicationsAndUsage', null] },
                                                {
                                                    $regexMatch: {
                                                        input: { $toLower: { $ifNull: ['$label.indicationsAndUsage', ''] } },
                                                        regex: searchPattern,
                                                        options: 'i',
                                                    },
                                                },
                                            ],
                                        },
                                    ],
                                },
                                4,
                                0,
                            ],
                        },
                        {
                            $cond: [
                                {
                                    $or: [
                                        {
                                            $and: [
                                                { $ne: ['$therapeuticClass', null] },
                                                {
                                                    $regexMatch: {
                                                        input: { $toLower: { $ifNull: ['$therapeuticClass', ''] } },
                                                        regex: searchPattern,
                                                        options: 'i',
                                                    },
                                                },
                                            ],
                                        },
                                        {
                                            $and: [
                                                { $ne: ['$manufacturer', null] },
                                                {
                                                    $regexMatch: {
                                                        input: { $toLower: { $ifNull: ['$manufacturer', ''] } },
                                                        regex: searchPattern,
                                                        options: 'i',
                                                    },
                                                },
                                            ],
                                        },
                                    ],
                                },
                                2,
                                0,
                            ],
                        },
                    ],
                },
            },
        });
        pipeline.push({ $match: { searchScore: { $gt: 0 } } });
        pipeline.push({ $sort: { searchScore: -1, drugName: 1 } });
        pipeline.push({
            $facet: {
                metadata: [{ $count: 'total' }],
                data: [
                    { $skip: skip },
                    { $limit: limit },
                    {
                        $project: {
                            searchScore: 0,
                            _id: 0,
                            __v: 0,
                            _hash: 0,
                        },
                    },
                ],
            },
        });
        const results = await this.drugModel.aggregate(pipeline).exec();
        const rawData = results[0]?.data || [];
        const total = results[0]?.metadata[0]?.total || 0;
        const totalPages = Math.ceil(total / limit);
        const data = rawData.map((drug) => {
            if (drug.label) {
                return {
                    ...drug,
                    indicationsAndUsage: drug.indicationsAndUsage || drug.label.indicationsAndUsage,
                    genericName: drug.genericName || drug.label.genericName,
                };
            }
            return drug;
        });
        if (process.env.NODE_ENV === 'development' && total === 0) {
            this.logger.debug(`No results found for weighted search: "${query}"`);
            const totalDocs = await this.drugModel.countDocuments().exec();
            this.logger.debug(`Total documents in database: ${totalDocs}`);
        }
        return {
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            },
        };
    }
    async findBySlug(slug) {
        const drug = await this.drugModel
            .findOne({ slug })
            .select('-_id -__v -_hash')
            .lean()
            .exec();
        if (!drug) {
            throw new common_1.NotFoundException(`Drug with slug "${slug}" not found`);
        }
        if (drug.label) {
            const mappedDrug = {
                ...drug,
                boxedWarning: drug.boxedWarning || drug.label.boxedWarning,
                warnings: drug.warnings || drug.label.warnings || drug.label.warningsAndPrecautions,
                precautions: drug.precautions || drug.label.precautions,
                adverseReactions: drug.adverseReactions || drug.label.adverseReactions,
                drugInteractions: drug.drugInteractions || drug.label.drugInteractions,
                contraindications: drug.contraindications || drug.label.contraindications,
                indicationsAndUsage: drug.indicationsAndUsage || drug.label.indicationsAndUsage,
                dosageAndAdministration: drug.dosageAndAdministration || drug.label.dosageAndAdministration,
                overdosage: drug.overdosage || drug.label.overdosage,
                description: drug.description || drug.label.description,
                clinicalPharmacology: drug.clinicalPharmacology || drug.label.clinicalPharmacology,
                nonClinicalToxicology: drug.nonClinicalToxicology || drug.label.nonClinicalToxicology || drug.label.nonclinicalToxicology,
                clinicalStudies: drug.clinicalStudies || drug.label.clinicalStudies,
                howSupplied: drug.howSupplied || drug.label.howSupplied,
                patientCounseling: drug.patientCounseling || drug.label.patientCounseling,
                principalDisplayPanel: drug.principalDisplayPanel || drug.label.principalDisplayPanel,
                genericName: drug.genericName || drug.label.genericName,
            };
            return mappedDrug;
        }
        return drug;
    }
    async getTherapeuticClasses() {
        const classes = await this.drugModel
            .distinct('therapeuticClass')
            .where('therapeuticClass').ne(null).ne('')
            .exec();
        return classes.sort();
    }
    async getManufacturers() {
        const manufacturers = await this.drugModel
            .distinct('manufacturer')
            .where('manufacturer').ne(null).ne('')
            .exec();
        return manufacturers.sort();
    }
    async searchByTherapeuticClass(therapeuticClass, page = 1, limit = 50) {
        const searchDto = {
            therapeuticClass,
            page,
            limit,
        };
        return this.findAll(searchDto);
    }
    async searchByManufacturer(manufacturer, page = 1, limit = 50) {
        const searchDto = {
            manufacturer,
            page,
            limit,
        };
        return this.findAll(searchDto);
    }
    async count() {
        return this.drugModel.countDocuments().exec();
    }
    async getAllDrugsIndexFormat() {
        const drugs = await this.drugModel
            .find()
            .select('drugName setId slug labeler genericName therapeuticClass manufacturer')
            .lean()
            .exec();
        return drugs.map(drug => ({
            drugName: drug.drugName,
            setId: drug.setId,
            slug: drug.slug,
            labeler: drug.labeler || drug.manufacturer,
            label: {
                genericName: drug.genericName,
                labelerName: drug.labeler || drug.manufacturer,
                productType: 'HUMAN PRESCRIPTION DRUG LABEL',
            },
            therapeuticClass: drug.therapeuticClass,
            manufacturer: drug.manufacturer,
        }));
    }
    async performTextSearch(query, filters) {
        const { therapeuticClass, manufacturer, page = 1, limit = 50 } = filters;
        const skip = (page - 1) * limit;
        const searchQuery = {
            $text: { $search: query },
        };
        if (therapeuticClass) {
            searchQuery.therapeuticClass = { $regex: therapeuticClass, $options: 'i' };
        }
        if (manufacturer) {
            searchQuery.manufacturer = { $regex: manufacturer, $options: 'i' };
        }
        const [drugs, total] = await Promise.all([
            this.drugModel
                .find(searchQuery, { score: { $meta: 'textScore' } })
                .select('-_id -__v -_hash')
                .sort({ score: { $meta: 'textScore' }, drugName: 1 })
                .skip(skip)
                .limit(limit)
                .lean()
                .exec(),
            this.drugModel.countDocuments(searchQuery),
        ]);
        const cleanedDrugs = drugs.map((drug) => {
            const { score, ...cleanDrug } = drug;
            return cleanDrug;
        });
        const totalPages = Math.ceil(total / limit);
        return {
            data: cleanedDrugs,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            },
        };
    }
};
exports.DrugsService = DrugsService;
exports.DrugsService = DrugsService = DrugsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(drug_schema_1.Drug.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], DrugsService);
//# sourceMappingURL=drugs.service.js.map