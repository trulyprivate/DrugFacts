import { Injectable } from '@nestjs/common';
import { MemoryCacheService } from '../../common/services/memory-cache.service';
import { RedisCacheService } from '../../common/services/redis-cache.service';
import { DrugsService } from '../drugs.service';
import { Drug } from '../schemas/drug.schema';
import { SearchDrugsDto } from '../dto/search-drugs.dto';

@Injectable()
export class DrugsCacheService {
  private readonly CACHE_PREFIX = 'drug:';
  private readonly SEARCH_PREFIX = 'search:';
  private readonly LIST_PREFIX = 'list:';

  constructor(
    private memoryCache: MemoryCacheService,
    private redisCache: RedisCacheService,
    private drugsService: DrugsService,
  ) {}

  async getDrugBySlug(slug: string): Promise<Drug> {
    const cacheKey = `${this.CACHE_PREFIX}${slug}`;
    
    // L1: Memory cache
    const memCached = await this.memoryCache.get<Drug>(cacheKey);
    if (memCached) {
      return memCached;
    }

    // L2: Redis cache
    const redisCached = await this.redisCache.get<Drug>(cacheKey);
    if (redisCached) {
      await this.memoryCache.set(cacheKey, redisCached, 300);
      return redisCached;
    }

    // L3: Database
    const drug = await this.drugsService.findBySlug(slug);
    
    // Cache in both layers
    await this.redisCache.set(cacheKey, drug, 3600); // 1 hour
    await this.memoryCache.set(cacheKey, drug, 300); // 5 minutes
    
    return drug;
  }

  async searchDrugs(searchDto: SearchDrugsDto) {
    // Create a stable cache key including searchType
    const cacheKey = `${this.SEARCH_PREFIX}${JSON.stringify({
      q: searchDto.q,
      therapeuticClass: searchDto.therapeuticClass,
      manufacturer: searchDto.manufacturer,
      page: searchDto.page,
      limit: searchDto.limit,
      searchType: searchDto.searchType,
    })}`;
    
    // Check memory cache first
    const memCached = await this.memoryCache.get(cacheKey);
    if (memCached) {
      return memCached;
    }

    // Check Redis cache
    const redisCached = await this.redisCache.get(cacheKey);
    if (redisCached) {
      await this.memoryCache.set(cacheKey, redisCached, 60); // 1 minute
      return redisCached;
    }

    // Fetch from database
    const result = await this.drugsService.findAll(searchDto);
    
    // Cache results with different TTLs based on search type
    const redisTTL = searchDto.searchType === 'text' ? 600 : 300; // Text search cached longer
    const memoryTTL = searchDto.searchType === 'text' ? 120 : 60;
    
    await this.redisCache.set(cacheKey, result, redisTTL);
    await this.memoryCache.set(cacheKey, result, memoryTTL);
    
    return result;
  }

  async getTherapeuticClasses(): Promise<string[]> {
    const cacheKey = `${this.LIST_PREFIX}therapeutic-classes`;
    
    // Try memory cache
    const memCached = await this.memoryCache.get<string[]>(cacheKey);
    if (memCached) {
      return memCached;
    }

    // Try Redis cache
    const redisCached = await this.redisCache.get<string[]>(cacheKey);
    if (redisCached) {
      await this.memoryCache.set(cacheKey, redisCached, 3600); // 1 hour
      return redisCached;
    }

    // Fetch from database
    const classes = await this.drugsService.getTherapeuticClasses();
    
    // Cache for 24 hours (static data)
    await this.redisCache.set(cacheKey, classes, 86400);
    await this.memoryCache.set(cacheKey, classes, 3600);
    
    return classes;
  }

  async getManufacturers(): Promise<string[]> {
    const cacheKey = `${this.LIST_PREFIX}manufacturers`;
    
    return this.redisCache.wrap(
      cacheKey,
      async () => {
        const manufacturers = await this.drugsService.getManufacturers();
        await this.memoryCache.set(cacheKey, manufacturers, 3600);
        return manufacturers;
      },
      86400, // 24 hours
    );
  }

  // Cache invalidation methods
  async invalidateDrug(slug: string): Promise<void> {
    const cacheKey = `${this.CACHE_PREFIX}${slug}`;
    await Promise.all([
      this.memoryCache.del(cacheKey),
      this.redisCache.del(cacheKey),
    ]);
  }

  async invalidateSearchCache(): Promise<void> {
    // In production, you might want to implement pattern-based deletion
    await this.memoryCache.flush();
    await this.redisCache.reset();
  }

  async invalidateListCache(): Promise<void> {
    const keys = [
      `${this.LIST_PREFIX}therapeutic-classes`,
      `${this.LIST_PREFIX}manufacturers`,
    ];
    
    await Promise.all(
      keys.flatMap(key => [
        this.memoryCache.del(key),
        this.redisCache.del(key),
      ])
    );
  }

  async warmCache(): Promise<void> {
    // Pre-load frequently accessed data
    await Promise.all([
      this.getTherapeuticClasses(),
      this.getManufacturers(),
    ]);
  }
}