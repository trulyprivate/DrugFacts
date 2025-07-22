import { DrugsService } from './drugs.service';
import { EnhancedRedisCacheService } from '../common/services/enhanced-redis-cache.service';
import { SearchDrugsDto } from './dto/search-drugs.dto';
import { Drug } from './schemas/drug.schema';
export declare class CachedDrugsService {
    private readonly drugsService;
    private readonly cacheService;
    private readonly logger;
    private readonly DRUG_DETAIL_TTL;
    private readonly SEARCH_RESULTS_TTL;
    private readonly LIST_DATA_TTL;
    private readonly INDEX_DATA_TTL;
    constructor(drugsService: DrugsService, cacheService: EnhancedRedisCacheService);
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
    findBySlugs(slugs: string[]): Promise<(Drug | null)[]>;
    invalidateDrug(slug: string): Promise<void>;
    invalidateSearchCaches(): Promise<void>;
    invalidateMetaCaches(): Promise<void>;
    warmupCache(): Promise<void>;
    getCacheStats(): Promise<{
        healthy: boolean;
        keys: number;
        memory?: string;
    }>;
}
