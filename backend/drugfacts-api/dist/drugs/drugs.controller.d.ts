import { DrugsService } from './drugs.service';
import { DrugsCacheService } from './services/drugs-cache.service';
import { CachedDrugsService } from './cached-drugs.service';
import { SearchDrugsDto } from './dto/search-drugs.dto';
export declare class DrugsController {
    private readonly drugsService;
    private readonly drugsCacheService;
    private readonly cachedDrugsService;
    constructor(drugsService: DrugsService, drugsCacheService: DrugsCacheService, cachedDrugsService: CachedDrugsService);
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
    getCacheStats(): Promise<{
        data: {
            healthy: boolean;
            keys: number;
            memory?: string;
        };
    }>;
    warmupCache(): Promise<{
        message: string;
    }>;
    invalidateDrug(slug: string): Promise<{
        message: string;
    }>;
    findBySlug(slug: string): Promise<{
        data: import("./schemas/drug.schema").Drug;
    }>;
}
