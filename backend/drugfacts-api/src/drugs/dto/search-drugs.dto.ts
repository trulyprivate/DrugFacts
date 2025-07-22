import { IsOptional, IsString, IsInt, Min, Max, MaxLength, Matches, IsEnum } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export enum SearchType {
  WEIGHTED = 'weighted',
  TEXT = 'text',
  STANDARD = 'standard',
}

export class SearchDrugsDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  @Transform(({ value }) => value?.trim())
  @Matches(/^[a-zA-Z0-9\s\-\.]+$/, {
    message: 'Search query contains invalid characters',
  })
  q?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  therapeuticClass?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  manufacturer?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 50;

  @IsOptional()
  @IsEnum(SearchType)
  @Transform(({ value }) => value?.toLowerCase())
  searchType?: SearchType = SearchType.WEIGHTED;
}