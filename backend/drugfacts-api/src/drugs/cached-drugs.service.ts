import { Injectable, Logger } from '@nestjs/common';
import { DrugsService } from './drugs.service';
import { EnhancedRedisCacheService } from '../common/services/enhanced-redis-cache.service';
import { SearchDrugsDto } from './dto/search-drugs.dto';
import { Drug } from './schemas/drug.schema';

@Injectable()
export class CachedDrugsService {
  private readonly logger = new Logger(CachedDrugsService.name);
  
  // Cache TTLs for different types of data
  private readonly DRUG_DETAIL_TTL = 3600; // 1 hour for individual drug details
  private readonly SEARCH_RESULTS_TTL = 900; // 15 minutes for search results
  private readonly LIST_DATA_TTL = 7200; // 2 hours for lists (therapeutic classes, manufacturers)
  private readonly INDEX_DATA_TTL = 1800; // 30 minutes for index data

  constructor(
    private readonly drugsService: DrugsService,
    private readonly cacheService: EnhancedRedisCacheService,
  ) {}

  /**
   * Find all drugs with caching
   */
  async findAll(searchDto: SearchDrugsDto) {
    // Generate cache key based on search parameters
    const cacheKey = this.cacheService.generateSearchCacheKey(
      searchDto.q || 'all',
      searchDto,
    );

    return this.cacheService.wrap(
      cacheKey,
      () => this.drugsService.findAll(searchDto),
      {
        ttl: this.SEARCH_RESULTS_TTL,
        compress: true,
        tags: ['search', 'drugs'],
      },
    );
  }

  /**
   * Find drug by slug with caching
   */
  async findBySlug(slug: string): Promise<Drug> {
    const cacheKey = this.cacheService.generateDrugCacheKey(slug, 'full');

    return this.cacheService.wrap(
      cacheKey,
      () => this.drugsService.findBySlug(slug),
      {
        ttl: this.DRUG_DETAIL_TTL,
        compress: true,
        tags: ['drug', `drug:${slug}`],
      },
    );
  }

  /**
   * Get therapeutic classes with caching
   */
  async getTherapeuticClasses(): Promise<string[]> {
    const cacheKey = 'meta:therapeutic-classes';

    return this.cacheService.wrap(
      cacheKey,
      () => this.drugsService.getTherapeuticClasses(),
      {
        ttl: this.LIST_DATA_TTL,
        compress: false,
        tags: ['meta', 'therapeutic-classes'],
      },
    );
  }

  /**
   * Get manufacturers with caching
   */
  async getManufacturers(): Promise<string[]> {
    const cacheKey = 'meta:manufacturers';

    return this.cacheService.wrap(
      cacheKey,
      () => this.drugsService.getManufacturers(),
      {
        ttl: this.LIST_DATA_TTL,
        compress: false,
        tags: ['meta', 'manufacturers'],
      },
    );
  }

  /**
   * Search by therapeutic class with caching
   */
  async searchByTherapeuticClass(
    therapeuticClass: string,
    page: number = 1,
    limit: number = 50,
  ) {
    const cacheKey = this.cacheService.generateListCacheKey('therapeutic', therapeuticClass) + 
                    `:page:${page}:limit:${limit}`;

    return this.cacheService.wrap(
      cacheKey,
      () => this.drugsService.searchByTherapeuticClass(therapeuticClass, page, limit),
      {
        ttl: this.SEARCH_RESULTS_TTL,
        compress: true,
        tags: ['search', 'therapeutic-class', `tc:${therapeuticClass}`],
      },
    );
  }

  /**
   * Search by manufacturer with caching
   */
  async searchByManufacturer(
    manufacturer: string,
    page: number = 1,
    limit: number = 50,
  ) {
    const cacheKey = this.cacheService.generateListCacheKey('manufacturer', manufacturer) + 
                    `:page:${page}:limit:${limit}`;

    return this.cacheService.wrap(
      cacheKey,
      () => this.drugsService.searchByManufacturer(manufacturer, page, limit),
      {
        ttl: this.SEARCH_RESULTS_TTL,
        compress: true,
        tags: ['search', 'manufacturer', `mfr:${manufacturer}`],
      },
    );
  }

  /**
   * Get drug count with caching
   */
  async count(): Promise<number> {
    const cacheKey = 'meta:drug-count';

    return this.cacheService.wrap(
      cacheKey,
      () => this.drugsService.count(),
      {
        ttl: this.LIST_DATA_TTL,
        compress: false,
        tags: ['meta', 'count'],
      },
    );
  }

  /**
   * Get all drugs in index format with caching
   */
  async getAllDrugsIndexFormat(): Promise<any[]> {
    const cacheKey = 'index:all-drugs';

    return this.cacheService.wrap(
      cacheKey,
      () => this.drugsService.getAllDrugsIndexFormat(),
      {
        ttl: this.INDEX_DATA_TTL,
        compress: true,
        tags: ['index', 'all-drugs'],
      },
    );
  }

  /**
   * Batch get multiple drugs by slugs
   */
  async findBySlugs(slugs: string[]): Promise<(Drug | null)[]> {
    // Generate cache keys for all slugs
    const cacheKeys = slugs.map(slug => 
      this.cacheService.generateDrugCacheKey(slug, 'full')
    );

    // Try to get all from cache
    const cachedResults = await this.cacheService.mget<Drug>(cacheKeys);

    // Find which ones need to be fetched
    const toFetch: { index: number; slug: string }[] = [];
    cachedResults.forEach((result, index) => {
      if (result === null) {
        toFetch.push({ index, slug: slugs[index] });
      }
    });

    // Fetch missing drugs
    if (toFetch.length > 0) {
      const fetchPromises = toFetch.map(({ slug }) => 
        this.drugsService.findBySlug(slug).catch(() => null)
      );
      
      const fetchedDrugs = await Promise.all(fetchPromises);

      // Cache the fetched drugs
      const cacheItems = toFetch.map((item, idx) => ({
        key: cacheKeys[item.index],
        value: fetchedDrugs[idx],
        options: {
          ttl: this.DRUG_DETAIL_TTL,
          compress: true,
          tags: ['drug', `drug:${item.slug}`],
        },
      })).filter(item => item.value !== null);

      if (cacheItems.length > 0) {
        await this.cacheService.mset(cacheItems);
      }

      // Merge results
      toFetch.forEach((item, idx) => {
        cachedResults[item.index] = fetchedDrugs[idx];
      });
    }

    return cachedResults;
  }

  /**
   * Invalidate cache for a specific drug
   */
  async invalidateDrug(slug: string): Promise<void> {
    this.logger.log(`Invalidating cache for drug: ${slug}`);
    
    // Invalidate specific drug cache
    await this.cacheService.del(
      this.cacheService.generateDrugCacheKey(slug, 'full')
    );
    
    // Invalidate by tag
    await this.cacheService.invalidateTag(`drug:${slug}`);
  }

  /**
   * Invalidate all search-related caches
   */
  async invalidateSearchCaches(): Promise<void> {
    this.logger.log('Invalidating all search caches');
    await this.cacheService.invalidateTag('search');
  }

  /**
   * Invalidate all metadata caches
   */
  async invalidateMetaCaches(): Promise<void> {
    this.logger.log('Invalidating all metadata caches');
    await this.cacheService.invalidateTag('meta');
  }

  /**
   * Warm up cache with frequently accessed drugs
   */
  async warmupCache(): Promise<void> {
    this.logger.log('Starting cache warmup');
    
    try {
      // Get top drugs (you might want to implement a method to get frequently accessed drugs)
      const topDrugs = await this.drugsService.findAll({ 
        page: 1, 
        limit: 20 
      });

      // Warm up individual drug caches
      const warmupPromises = topDrugs.data.map(drug => 
        this.findBySlug(drug.slug).catch(err => 
          this.logger.error(`Failed to warm up drug ${drug.slug}:`, err)
        )
      );

      // Warm up metadata
      warmupPromises.push(
        this.getTherapeuticClasses().catch(err => 
          this.logger.error('Failed to warm up therapeutic classes:', err)
        ),
        this.getManufacturers().catch(err => 
          this.logger.error('Failed to warm up manufacturers:', err)
        ),
        this.count().catch(err => 
          this.logger.error('Failed to warm up count:', err)
        ),
      );

      await Promise.all(warmupPromises);
      
      this.logger.log('Cache warmup completed');
    } catch (error) {
      this.logger.error('Cache warmup failed:', error);
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats() {
    return this.cacheService.getStats();
  }
}