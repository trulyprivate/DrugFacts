import {
  Controller,
  Get,
  Query,
  Param,
  ValidationPipe,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { DrugsService } from './drugs.service';
import { SearchDrugsDto } from './dto/search-drugs.dto';

@Controller('api/drugs')
@UseInterceptors(ClassSerializerInterceptor)
export class DrugsController {
  constructor(private readonly drugsService: DrugsService) {}

  @Get()
  async findAll(
    @Query(new ValidationPipe({ transform: true })) searchDto: SearchDrugsDto,
  ) {
    return this.drugsService.findAll(searchDto);
  }

  @Get('index')
  async getIndexFormat() {
    // Returns all drugs in the format matching index.json
    const drugs = await this.drugsService.getAllDrugsIndexFormat();
    return drugs;
  }

  @Get('therapeutic-classes')
  async getTherapeuticClasses() {
    const classes = await this.drugsService.getTherapeuticClasses();
    return { data: classes };
  }

  @Get('manufacturers')
  async getManufacturers() {
    const manufacturers = await this.drugsService.getManufacturers();
    return { data: manufacturers };
  }

  @Get('count')
  async count() {
    const count = await this.drugsService.count();
    return { count };
  }

  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    const drug = await this.drugsService.findBySlug(slug);
    return { data: drug };
  }
}