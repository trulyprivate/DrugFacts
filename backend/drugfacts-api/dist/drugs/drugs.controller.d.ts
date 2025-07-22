import { DrugsService } from './drugs.service';
import { SearchDrugsDto } from './dto/search-drugs.dto';
export declare class DrugsController {
    private readonly drugsService;
    constructor(drugsService: DrugsService);
    findAll(searchDto: SearchDrugsDto): Promise<{
        data: (import("mongoose").FlattenMaps<import("./schemas/drug.schema").DrugDocument> & Required<{
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
    getIndexFormat(): Promise<any[]>;
    getTherapeuticClasses(): Promise<{
        data: string[];
    }>;
    getManufacturers(): Promise<{
        data: string[];
    }>;
    count(): Promise<{
        count: number;
    }>;
    findBySlug(slug: string): Promise<{
        data: import("./schemas/drug.schema").Drug;
    }>;
}
