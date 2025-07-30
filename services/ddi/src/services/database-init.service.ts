import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Drug } from '../schemas/drug.schema';
import { DrugInteraction, SeverityLevel, MechanismType } from '../schemas/interaction.schema';

@Injectable()
export class DatabaseInitService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseInitService.name);

  constructor(
    @InjectModel(Drug.name) private drugModel: Model<Drug>,
    @InjectModel(DrugInteraction.name) private interactionModel: Model<DrugInteraction>,
  ) {}

  async onModuleInit() {
    await this.initializeDatabase();
  }

  private async initializeDatabase() {
    try {
      this.logger.log('Checking database initialization...');
      
      const drugCount = await this.drugModel.countDocuments();
      const interactionCount = await this.interactionModel.countDocuments();
      
      this.logger.log(`Current database state: ${drugCount} drugs, ${interactionCount} interactions`);
      
      if (drugCount === 0) {
        await this.seedSampleData();
      }
      
      await this.ensureIndexes();
      
      this.logger.log('Database initialization completed');
    } catch (error) {
      this.logger.error('Database initialization failed:', error);
    }
  }

  private async seedSampleData() {
    this.logger.log('Seeding sample data...');
    
    // Sample drugs
    const sampleDrugs = [
      {
        rxcui: '198440',
        name: 'Aspirin',
        genericName: 'aspirin',
        brandNames: ['Bayer', 'Ecotrin', 'Bufferin'],
        activeIngredients: ['aspirin'],
        strength: '325mg',
        dosageForm: 'tablet',
        route: 'oral',
        therapeuticClasses: ['Analgesic', 'Antiplatelet'],
        isActive: true,
        lastUpdated: new Date(),
      },
      {
        rxcui: '11289',
        name: 'Warfarin',
        genericName: 'warfarin',
        brandNames: ['Coumadin', 'Jantoven'],
        activeIngredients: ['warfarin sodium'],
        strength: '5mg',
        dosageForm: 'tablet',
        route: 'oral',
        therapeuticClasses: ['Anticoagulant'],
        isActive: true,
        lastUpdated: new Date(),
      },
      {
        rxcui: '2670',
        name: 'Ibuprofen',
        genericName: 'ibuprofen',
        brandNames: ['Advil', 'Motrin'],
        activeIngredients: ['ibuprofen'],
        strength: '200mg',
        dosageForm: 'tablet',
        route: 'oral',
        therapeuticClasses: ['NSAID', 'Analgesic'],
        isActive: true,
        lastUpdated: new Date(),
      },
    ];

    const createdDrugs = await this.drugModel.insertMany(sampleDrugs);
    this.logger.log(`Created ${createdDrugs.length} sample drugs`);

    // Sample interactions
    const sampleInteractions = [
      {
        drug1: createdDrugs[0]._id, // Aspirin
        drug2: createdDrugs[1]._id, // Warfarin
        severity: SeverityLevel.MAJOR,
        mechanism: MechanismType.PHARMACODYNAMIC,
        description: 'Aspirin may increase the anticoagulant effect of warfarin, increasing the risk of bleeding.',
        management: 'Monitor INR closely. Consider dose adjustment of warfarin. Watch for signs of bleeding.',
        clinicalEvidence: 'Well-documented interaction with significant clinical impact.',
        references: [
          {
            title: 'Drug interactions with warfarin: a systematic review',
            authors: 'Holbrook AM, et al.',
            journal: 'Arch Intern Med',
            year: 2005,
            pmid: '15851641',
            url: 'https://pubmed.ncbi.nlm.nih.gov/15851641/',
          },
        ],
        lastUpdated: new Date(),
        isActive: true,
        sourceSystem: 'manual',
        sourceId: 'asp-war-001',
      },
      {
        drug1: createdDrugs[2]._id, // Ibuprofen
        drug2: createdDrugs[1]._id, // Warfarin
        severity: SeverityLevel.MODERATE,
        mechanism: MechanismType.PHARMACOKINETIC,
        description: 'Ibuprofen may increase warfarin levels by inhibiting its metabolism.',
        management: 'Monitor INR when starting or stopping ibuprofen. Use acetaminophen as alternative if possible.',
        clinicalEvidence: 'Moderate evidence from case reports and small studies.',
        references: [],
        lastUpdated: new Date(),
        isActive: true,
        sourceSystem: 'manual',
        sourceId: 'ibu-war-001',
      },
    ];

    const createdInteractions = await this.interactionModel.insertMany(sampleInteractions);
    this.logger.log(`Created ${createdInteractions.length} sample interactions`);
  }

  private async ensureIndexes() {
    this.logger.log('Ensuring database indexes...');
    
    // Drug indexes
    await this.drugModel.collection.createIndex({ rxcui: 1 }, { unique: true });
    await this.drugModel.collection.createIndex({ name: 'text', genericName: 'text' });
    await this.drugModel.collection.createIndex({ brandNames: 1 });
    await this.drugModel.collection.createIndex({ activeIngredients: 1 });
    
    // Interaction indexes
    await this.interactionModel.collection.createIndex({ drug1: 1, drug2: 1 });
    await this.interactionModel.collection.createIndex({ severity: 1, isActive: 1 });
    await this.interactionModel.collection.createIndex({ lastUpdated: -1 });
    
    this.logger.log('Database indexes created');
  }
}