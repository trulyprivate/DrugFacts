import { Injectable, Inject, CACHE_MANAGER } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cache } from 'cache-manager';
import { DrugInteraction } from '../../schemas/interaction.schema';
import { Drug } from '../../schemas/drug.schema';
import { CheckInteractionsDto } from '../../dto/check-interactions.dto';
import { SearchDrugsDto } from '../../dto/search-drugs.dto';

@Injectable()
export class InteractionsService {
  constructor(
    @InjectModel(DrugInteraction.name) private interactionModel: Model<DrugInteraction>,
    @InjectModel(Drug.name) private drugModel: Model<Drug>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async checkInteractions(checkInteractionsDto: CheckInteractionsDto) {
    const { drugIds, includeMinor = false } = checkInteractionsDto;
    
    if (drugIds.length < 2) {
      return {
        interactions: [],
        summary: {
          total: 0,
          severity: {
            minor: 0,
            moderate: 0,
            major: 0,
            contraindicated: 0,
          },
        },
      };
    }

    const cacheKey = `interactions:${drugIds.sort().join('-')}:${includeMinor}`;
    const cached = await this.cacheManager.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const interactions = await this.findInteractionPairs(drugIds, includeMinor);
    const result = this.buildInteractionResult(interactions);

    await this.cacheManager.set(cacheKey, result, 86400); // 24 hours
    return result;
  }

  async searchDrugs(searchDrugsDto: SearchDrugsDto) {
    const { query, limit = 10 } = searchDrugsDto;
    
    const cacheKey = `drug-search:${query}:${limit}`;
    const cached = await this.cacheManager.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const drugs = await this.drugModel
      .find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { genericName: { $regex: query, $options: 'i' } },
          { brandNames: { $elemMatch: { $regex: query, $options: 'i' } } },
          { activeIngredients: { $elemMatch: { $regex: query, $options: 'i' } } },
        ],
      })
      .limit(limit)
      .select('name genericName brandNames activeIngredients rxcui')
      .exec();

    const result = { drugs };
    await this.cacheManager.set(cacheKey, result, 7200); // 2 hours
    return result;
  }

  private async findInteractionPairs(drugIds: string[], includeMinor: boolean) {
    const severityFilter = includeMinor 
      ? {} 
      : { severity: { $ne: 'minor' } };

    return this.interactionModel
      .find({
        $and: [
          {
            $or: drugIds.flatMap(id1 => 
              drugIds
                .filter(id2 => id2 !== id1)
                .map(id2 => ({
                  $or: [
                    { 'drug1.rxcui': id1, 'drug2.rxcui': id2 },
                    { 'drug1.rxcui': id2, 'drug2.rxcui': id1 },
                  ],
                }))
            ),
          },
          severityFilter,
        ],
      })
      .populate(['drug1', 'drug2'])
      .exec();
  }

  private buildInteractionResult(interactions: DrugInteraction[]) {
    const summary = {
      total: interactions.length,
      severity: {
        minor: 0,
        moderate: 0,
        major: 0,
        contraindicated: 0,
      },
    };

    interactions.forEach(interaction => {
      summary.severity[interaction.severity]++;
    });

    return {
      interactions: interactions.map(interaction => ({
        id: interaction._id,
        drug1: interaction.drug1,
        drug2: interaction.drug2,
        severity: interaction.severity,
        mechanism: interaction.mechanism,
        description: interaction.description,
        management: interaction.management,
        references: interaction.references,
        lastUpdated: interaction.lastUpdated,
      })),
      summary,
    };
  }
}