import { Controller, Get, Post, Body, Query, UseInterceptors, CacheInterceptor } from '@nestjs/common';
import { InteractionsService } from './interactions.service';
import { CheckInteractionsDto } from '../../dto/check-interactions.dto';
import { SearchDrugsDto } from '../../dto/search-drugs.dto';

@Controller('interactions')
@UseInterceptors(CacheInterceptor)
export class InteractionsController {
  constructor(private readonly interactionsService: InteractionsService) {}

  @Post('check')
  async checkInteractions(@Body() checkInteractionsDto: CheckInteractionsDto) {
    return this.interactionsService.checkInteractions(checkInteractionsDto);
  }

  @Get('drugs/search')
  async searchDrugs(@Query() searchDrugsDto: SearchDrugsDto) {
    return this.interactionsService.searchDrugs(searchDrugsDto);
  }

  @Get('severity-levels')
  getSeverityLevels() {
    return {
      levels: [
        { value: 'minor', label: 'Minor', description: 'Minimal clinical significance' },
        { value: 'moderate', label: 'Moderate', description: 'May require therapy modification' },
        { value: 'major', label: 'Major', description: 'May be life-threatening' },
        { value: 'contraindicated', label: 'Contraindicated', description: 'Avoid combination' },
      ],
    };
  }

  @Get('mechanisms')
  getMechanisms() {
    return {
      mechanisms: [
        { value: 'pharmacokinetic', label: 'Pharmacokinetic', description: 'Affects drug absorption, distribution, metabolism, or excretion' },
        { value: 'pharmacodynamic', label: 'Pharmacodynamic', description: 'Affects drug activity at the receptor level' },
        { value: 'unknown', label: 'Unknown', description: 'Mechanism not well understood' },
      ],
    };
  }
}