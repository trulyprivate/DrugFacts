import { MemoryCacheService } from '../../common/services/memory-cache.service';
import { RedisCacheService } from '../../common/services/redis-cache.service';
import { DrugsService } from '../drugs.service';
import { Drug } from '../schemas/drug.schema';
import { SearchDrugsDto } from '../dto/search-drugs.dto';
export declare class DrugsCacheService {
    private memoryCache;
    private redisCache;
    private drugsService;
    private readonly CACHE_PREFIX;
    private readonly SEARCH_PREFIX;
    private readonly LIST_PREFIX;
    constructor(memoryCache: MemoryCacheService, redisCache: RedisCacheService, drugsService: DrugsService);
    getDrugBySlug(slug: string): Promise<Drug>;
    searchDrugs(searchDto: SearchDrugsDto): Promise<{}>;
    getTherapeuticClasses(): Promise<string[]>;
    getManufacturers(): Promise<string[]>;
    invalidateDrug(slug: string): Promise<void>;
    invalidateSearchCache(): Promise<void>;
    invalidateListCache(): Promise<void>;
    warmCache(): Promise<void>;
}
