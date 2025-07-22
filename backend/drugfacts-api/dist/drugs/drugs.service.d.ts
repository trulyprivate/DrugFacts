import { Model } from 'mongoose';
import { Drug, DrugDocument } from './schemas/drug.schema';
import { SearchDrugsDto } from './dto/search-drugs.dto';
export declare class DrugsService {
    private drugModel;
    constructor(drugModel: Model<DrugDocument>);
    findAll(searchDto: SearchDrugsDto): Promise<{
        data: (import("mongoose").FlattenMaps<DrugDocument> & Required<{
            _id: import("mongoose").FlattenMaps<unknown>;
        }> & {
            __v: number;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }>;
    findBySlug(slug: string): Promise<Drug>;
    getTherapeuticClasses(): Promise<string[]>;
    getManufacturers(): Promise<string[]>;
    searchByTherapeuticClass(therapeuticClass: string, page?: number, limit?: number): Promise<{
        data: (import("mongoose").FlattenMaps<DrugDocument> & Required<{
            _id: import("mongoose").FlattenMaps<unknown>;
        }> & {
            __v: number;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }>;
    searchByManufacturer(manufacturer: string, page?: number, limit?: number): Promise<{
        data: (import("mongoose").FlattenMaps<DrugDocument> & Required<{
            _id: import("mongoose").FlattenMaps<unknown>;
        }> & {
            __v: number;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }>;
    count(): Promise<number>;
    getAllDrugsIndexFormat(): Promise<any[]>;
}
