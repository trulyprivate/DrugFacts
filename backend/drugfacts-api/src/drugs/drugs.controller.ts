import {
  Controller,
  Get,
  Query,
  Param,
  ValidationPipe,
  UseInterceptors,
  ClassSerializerInterceptor,
  Post,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { DrugsService } from './drugs.service';
import { DrugsCacheService } from './services/drugs-cache.service';
import { CachedDrugsService } from './cached-drugs.service';
import { SearchDrugsDto } from './dto/search-drugs.dto';

@Controller('drugs')
@UseInterceptors(ClassSerializerInterceptor)
export class DrugsController {
  constructor(
    private readonly drugsService: DrugsService,
    private readonly drugsCacheService: DrugsCacheService,
    private readonly cachedDrugsService: CachedDrugsService,
  ) {}

  @Get()
  async findAll(
    @Query(new ValidationPipe({ transform: true })) searchDto: SearchDrugsDto,
  ) {
    // Use enhanced Redis caching if available
    return this.cachedDrugsService.findAll(searchDto);
  }

  @Get('index')
  async getIndexFormat() {
    // Returns all drugs in the format matching index.json with caching
    const drugs = await this.cachedDrugsService.getAllDrugsIndexFormat();
    return drugs;
  }

  @Get('therapeutic-classes')
  async getTherapeuticClasses() {
    const classes = await this.cachedDrugsService.getTherapeuticClasses();
    return { data: classes };
  }

  @Get('manufacturers')
  async getManufacturers() {
    const manufacturers = await this.cachedDrugsService.getManufacturers();
    return { data: manufacturers };
  }

  @Get('count')
  async count() {
    const count = await this.cachedDrugsService.count();
    return { count };
  }

  @Get('cache/stats')
  async getCacheStats() {
    const stats = await this.cachedDrugsService.getCacheStats();
    return { data: stats };
  }

  @Post('cache/warmup')
  @HttpCode(HttpStatus.OK)
  async warmupCache() {
    await this.cachedDrugsService.warmupCache();
    return { message: 'Cache warmup initiated' };
  }

  @Post('cache/invalidate/:slug')
  @HttpCode(HttpStatus.OK)
  async invalidateDrug(@Param('slug') slug: string) {
    await this.cachedDrugsService.invalidateDrug(slug);
    return { message: `Cache invalidated for drug: ${slug}` };
  }

  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    const drug = await this.cachedDrugsService.findBySlug(slug);
    return { data: drug };
  }
}