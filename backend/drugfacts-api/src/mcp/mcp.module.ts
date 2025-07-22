import { Module } from '@nestjs/common';
import { DrugsModule } from '../drugs/drugs.module';
import { McpService } from './mcp.service';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [DrugsModule, CommonModule],
  providers: [McpService],
  exports: [McpService],
})
export class McpModule {}