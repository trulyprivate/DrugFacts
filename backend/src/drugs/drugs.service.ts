import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Drug, DrugDocument } from './schemas/drug.schema';
import { SearchDrugsDto } from './dto/search-drugs.dto';

@Injectable()
export class DrugsService {
  constructor(
    @InjectModel(Drug.name) private drugModel: Model<DrugDocument>,
  ) {}

  async findAll(searchDto: SearchDrugsDto) {
    const { q, therapeuticClass, manufacturer, page = 1, limit = 50 } = searchDto;
    
    // Build query
    const query: any = {};
    
    if (q) {
      // Search in multiple fields
      query.$or = [
        { drugName: { $regex: q, $options: 'i' } },
        { genericName: { $regex: q, $options: 'i' } },
        { activeIngredient: { $regex: q, $options: 'i' } },
        { manufacturer: { $regex: q, $options: 'i' } },
        { therapeuticClass: { $regex: q, $options: 'i' } },
      ];
    }
    
    if (therapeuticClass) {
      query.therapeuticClass = { $regex: therapeuticClass, $options: 'i' };
    }
    
    if (manufacturer) {
      query.manufacturer = { $regex: manufacturer, $options: 'i' };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    
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

  async findBySlug(slug: string): Promise<Drug> {
    const drug = await this.drugModel
      .findOne({ slug })
      .select('-_id -__v -_hash')
      .lean()
      .exec();
      
    if (!drug) {
      throw new NotFoundException(`Drug with slug "${slug}" not found`);
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
}