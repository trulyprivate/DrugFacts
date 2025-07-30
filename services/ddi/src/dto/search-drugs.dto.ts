import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class SearchDrugsDto {
  @IsString()
  query: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  @Transform(({ value }) => parseInt(value))
  limit?: number = 10;

  @IsOptional()
  @IsString()
  category?: string;
}