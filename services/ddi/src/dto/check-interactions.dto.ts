import { IsArray, IsBoolean, IsOptional, IsString, ArrayMinSize, ArrayMaxSize } from 'class-validator';
import { Transform } from 'class-transformer';

export class CheckInteractionsDto {
  @IsArray()
  @ArrayMinSize(2, { message: 'At least 2 drugs are required to check interactions' })
  @ArrayMaxSize(20, { message: 'Maximum 20 drugs can be checked at once' })
  @IsString({ each: true })
  drugIds: string[];

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  includeMinor?: boolean = false;

  @IsOptional()
  @IsString()
  patientId?: string;
}