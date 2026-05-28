import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
} from 'class-validator';
import { CatSource, CatStatus } from '../schemas/cat.schemas';

export class CreateCatDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  breed?: string;

  @IsOptional()
  @IsString()
  ageCategory?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isSpayed?: boolean;

  @IsOptional()
  @IsString()
  vaccinationStatus?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsEnum(CatStatus)
  status?: CatStatus;

  @IsOptional()
  @IsEnum(CatSource)
  source?: CatSource;

  @IsOptional()
  @IsString()
  externalGovId?: string;

  @IsOptional()
  @IsMongoId()
  uploaderId?: string;
}
