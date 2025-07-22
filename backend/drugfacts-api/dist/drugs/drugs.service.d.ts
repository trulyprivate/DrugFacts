import { OnModuleInit } from '@nestjs/common';
import { Model } from 'mongoose';
import { Drug, DrugDocument } from './schemas/drug.schema';
import { SearchDrugsDto } from './dto/search-drugs.dto';
export declare class DrugsService implements OnModuleInit {
    private drugModel;
    private readonly logger;
    constructor(drugModel: Model<DrugDocument>);
    onModuleInit(): Promise<void>;
    private createIndexes;
    findAll(searchDto: SearchDrugsDto): Promise<{
        data: any;
        pagination: {
            page: number;
            limit: number;
            total: any;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }>;
    private performWeightedSearch;
    findBySlug(slug: string): Promise<Drug>;
    getTherapeuticClasses(): Promise<string[]>;
    getManufacturers(): Promise<string[]>;
    searchByTherapeuticClass(therapeuticClass: string, page?: number, limit?: number): Promise<{
        data: any;
        pagination: {
            page: number;
            limit: number;
            total: any;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }>;
    searchByManufacturer(manufacturer: string, page?: number, limit?: number): Promise<{
        data: any;
        pagination: {
            page: number;
            limit: number;
            total: any;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }>;
    count(): Promise<number>;
    getAllDrugsIndexFormat(): Promise<any[]>;
    performTextSearch(query: string, filters: {
        therapeuticClass?: string;
        manufacturer?: string;
        page: number;
        limit: number;
    }): Promise<{
        data: any[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }>;
}
