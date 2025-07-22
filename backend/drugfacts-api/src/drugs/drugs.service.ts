import { Injectable, NotFoundException, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Drug, DrugDocument } from './schemas/drug.schema';
import { SearchDrugsDto, SearchType } from './dto/search-drugs.dto';

@Injectable()
export class DrugsService implements OnModuleInit {
  private readonly logger = new Logger(DrugsService.name);

  constructor(
    @InjectModel(Drug.name) private drugModel: Model<DrugDocument>,
  ) {}

  async onModuleInit() {
    await this.createIndexes();
  }

  /**
   * Create database indexes for optimized search performance
   */
  private async createIndexes() {
    try {
      // Create text index for full-text search
      await this.drugModel.collection.createIndex(
        {
          drugName: 'text',
          genericName: 'text',
          activeIngredient: 'text',
          indicationsAndUsage: 'text',
          'label.indicationsAndUsage': 'text',
          'label.genericName': 'text',
          'label.description': 'text',
          therapeuticClass: 'text',
          manufacturer: 'text',
        },
        {
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
        },
      );

      // Create compound indexes for common queries
      await this.drugModel.collection.createIndex(
        { drugName: 1, therapeuticClass: 1 },
        { name: 'drug_name_class', background: true },
      );

      await this.drugModel.collection.createIndex(
        { slug: 1 },
        { unique: true, name: 'slug_unique', background: true },
      );

      await this.drugModel.collection.createIndex(
        { therapeuticClass: 1 },
        { name: 'therapeutic_class', background: true },
      );

      await this.drugModel.collection.createIndex(
        { manufacturer: 1 },
        { name: 'manufacturer', background: true },
      );

      this.logger.log('Database indexes created successfully');
    } catch (error) {
      this.logger.error('Error creating indexes:', error);
    }
  }

  async findAll(searchDto: SearchDrugsDto) {
    const { 
      q, 
      therapeuticClass, 
      manufacturer, 
      page = 1, 
      limit = 50,
      searchType = SearchType.WEIGHTED 
    } = searchDto;
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    if (q) {
      // Choose search method based on searchType
      switch (searchType) {
        case SearchType.TEXT:
          return this.performTextSearch(q, { therapeuticClass, manufacturer, page, limit });
        
        case SearchType.WEIGHTED:
          return this.performWeightedSearch(q, { therapeuticClass, manufacturer, page, limit, skip });
        
        case SearchType.STANDARD:
        default:
          // Fall through to standard search below
          break;
      }
    }
    
    // Build standard query for non-search filters or standard search type
    const query: any = {};
    
    if (q && searchType === SearchType.STANDARD) {
      // Standard search across multiple fields
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
    
    // Execute query with pagination
    const [drugs, total] = await Promise.all([
      this.drugModel
        .find(query)
        .select('-_id -__v -_hash') // Exclude MongoDB internal fields
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.drugModel.countDocuments(query),
    ]);

    // Calculate pagination metadata
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

  /**
   * Performs weighted search prioritizing drug names over other fields
   * Priority order:
   * 1. Exact match on drugName (weight: 10)
   * 2. Partial match on drugName (weight: 8)
   * 3. Match on genericName (weight: 6)
   * 4. Match on activeIngredient (weight: 5)
   * 5. Match in indicationsAndUsage (weight: 4)
   * 6. Match in other fields (weight: 2)
   */
  private async performWeightedSearch(
    query: string,
    filters: {
      therapeuticClass?: string;
      manufacturer?: string;
      page: number;
      limit: number;
      skip: number;
    },
  ) {
    const { therapeuticClass, manufacturer, page, limit, skip } = filters;
    
    // Create aggregation pipeline for weighted search
    const pipeline: any[] = [];
    
    // Add match stage for filters
    const matchStage: any = {};
    if (therapeuticClass) {
      matchStage.therapeuticClass = { $regex: therapeuticClass, $options: 'i' };
    }
    if (manufacturer) {
      matchStage.manufacturer = { $regex: manufacturer, $options: 'i' };
    }
    
    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }
    
    // Create a regex pattern for flexible matching
    const searchPattern = query.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Add search scoring stage
    pipeline.push({
      $addFields: {
        searchScore: {
          $add: [
            // Exact match on drugName (weight: 10)
            {
              $cond: [
                { $eq: [{ $toLower: '$drugName' }, query.toLowerCase()] },
                10,
                0,
              ],
            },
            // Partial match on drugName (weight: 8)
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
            // Match on genericName (weight: 6)
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
            // Match on activeIngredient (weight: 5)
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
            // Match in indicationsAndUsage (weight: 4) - check both root and label.indicationsAndUsage
            {
              $cond: [
                {
                  $or: [
                    // Check root-level indicationsAndUsage
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
                    // Check label.indicationsAndUsage
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
            // Match in therapeuticClass or manufacturer (weight: 2)
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
    
    // Filter out results with zero score
    pipeline.push({ $match: { searchScore: { $gt: 0 } } });
    
    // Sort by score (descending) and then by drugName (ascending)
    pipeline.push({ $sort: { searchScore: -1, drugName: 1 } });
    
    // Add facet for pagination
    pipeline.push({
      $facet: {
        metadata: [{ $count: 'total' }],
        data: [
          { $skip: skip },
          { $limit: limit },
          {
            $project: {
              searchScore: 0, // Remove score from final output
              _id: 0,
              __v: 0,
              _hash: 0,
            },
          },
        ],
      },
    });
    
    // Execute aggregation
    const results = await this.drugModel.aggregate(pipeline).exec();
    
    // Extract data and metadata
    const rawData = results[0]?.data || [];
    const total = results[0]?.metadata[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);
    
    // Map label fields to root level for backward compatibility
    const data = rawData.map((drug: any) => {
      if (drug.label) {
        return {
          ...drug,
          // Only map indicationsAndUsage for search results to keep response size smaller
          indicationsAndUsage: drug.indicationsAndUsage || drug.label.indicationsAndUsage,
          genericName: drug.genericName || drug.label.genericName,
        };
      }
      return drug;
    });
    
    // Debug logging for development
    if (process.env.NODE_ENV === 'development' && total === 0) {
      this.logger.debug(`No results found for weighted search: "${query}"`);
      // Try a simple count to see if there's any data
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

  async findBySlug(slug: string): Promise<Drug> {
    const drug = await this.drugModel
      .findOne({ slug })
      .select('-_id -__v -_hash')
      .lean()
      .exec();
      
    if (!drug) {
      throw new NotFoundException(`Drug with slug "${slug}" not found`);
    }
    
    // Map label fields to root level for backward compatibility
    if (drug.label) {
      const mappedDrug = {
        ...drug,
        // Map label fields to root if they don't already exist
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
      return mappedDrug as Drug;
    }
    
    return drug;
  }

  async getTherapeuticClasses(): Promise<string[]> {
    const classes = await this.drugModel
      .distinct('therapeuticClass')
      .where('therapeuticClass').ne(null).ne('')
      .exec();
      
    return classes.sort();
  }

  async getManufacturers(): Promise<string[]> {
    const manufacturers = await this.drugModel
      .distinct('manufacturer')
      .where('manufacturer').ne(null).ne('')
      .exec();
      
    return manufacturers.sort();
  }

  async searchByTherapeuticClass(
    therapeuticClass: string,
    page: number = 1,
    limit: number = 50,
  ) {
    const searchDto: SearchDrugsDto = {
      therapeuticClass,
      page,
      limit,
    };
    
    return this.findAll(searchDto);
  }

  async searchByManufacturer(
    manufacturer: string,
    page: number = 1,
    limit: number = 50,
  ) {
    const searchDto: SearchDrugsDto = {
      manufacturer,
      page,
      limit,
    };
    
    return this.findAll(searchDto);
  }

  async count(): Promise<number> {
    return this.drugModel.countDocuments().exec();
  }

  // Get all drugs in the format matching the current index.json
  async getAllDrugsIndexFormat(): Promise<any[]> {
    const drugs = await this.drugModel
      .find()
      .select('drugName setId slug labeler genericName therapeuticClass manufacturer')
      .lean()
      .exec();

    // Transform to match index.json format
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

  /**
   * Alternative search method using MongoDB text search
   * This is faster for large datasets but less flexible than weighted search
   */
  async performTextSearch(
    query: string,
    filters: {
      therapeuticClass?: string;
      manufacturer?: string;
      page: number;
      limit: number;
    },
  ) {
    const { therapeuticClass, manufacturer, page = 1, limit = 50 } = filters;
    const skip = (page - 1) * limit;
    
    // Build the search query
    const searchQuery: any = {
      $text: { $search: query },
    };
    
    // Add filters
    if (therapeuticClass) {
      searchQuery.therapeuticClass = { $regex: therapeuticClass, $options: 'i' };
    }
    
    if (manufacturer) {
      searchQuery.manufacturer = { $regex: manufacturer, $options: 'i' };
    }
    
    // Execute query with text score sorting
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
    
    // Remove score from results if it exists
    const cleanedDrugs = drugs.map((drug: any) => {
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
}