import { IsArray, IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

const parseJsonValue = (value: unknown) => {
  if (typeof value !== 'string') return value;
  if (!value.trim()) return undefined;

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const parseStringArray = (value: unknown) => {
  const parsed = parseJsonValue(value);
  if (Array.isArray(parsed)) {
    return parsed.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof parsed === 'string') {
    return parsed.split(',').map((item) => item.trim()).filter(Boolean);
  }

  return parsed;
};

const parseObject = (value: unknown) => parseJsonValue(value);

const parseOptionalNumber = (value: unknown) => {
  if (value === '' || value === null || value === undefined) return undefined;
  return Number(value);
};

export class ProductDimensionDto {
  @IsOptional() @IsString()
  height?: string;

  @IsOptional() @IsString()
  width?: string;

  @IsOptional() @IsString()
  depth?: string;

  @IsOptional() @IsString()
  raw?: string;
}

export class CreateProductDto {
  @IsString() name: string;
  @IsString() description: string;

  @IsString()
  sku: string;

  @IsOptional() @IsString()
  slug?: string;

  @IsOptional() @IsString()
  series?: string;

  @IsOptional() @IsString()
  finish?: string;

  @IsOptional() @IsString()
  lightSource?: string;

  @IsOptional()
  @Transform(({ value }) => parseOptionalNumber(value))
  @IsNumber()
  watt?: number;

  @IsOptional() @IsString()
  inputVoltage?: string;

  @IsOptional()
  @Transform(({ value }) => parseOptionalNumber(value))
  @IsNumber()
  lmPerW?: number;

  @IsOptional()
  @Transform(({ value }) => parseOptionalNumber(value))
  @IsNumber()
  fluxLumin?: number;

  @IsOptional()
  @Transform(({ value }) => parseOptionalNumber(value))
  @IsNumber()
  ra?: number;

  @IsOptional() @IsString()
  chipBrand?: string;

  @IsOptional()
  @Transform(({ value }) => parseOptionalNumber(value))
  @IsNumber()
  pf?: number;

  @IsOptional() @IsString()
  cutSize?: string;

  @IsOptional()
  @Transform(({ value }) => parseOptionalNumber(value))
  @IsNumber()
  beamAngle?: number;

  @IsOptional() @IsString()
  ipRate?: string;

  @IsOptional() @IsString()
  remark?: string;

  @IsOptional() @IsString()
  productId?: string;

  @IsOptional() @IsString()
  Fineshed?: string;

  @IsOptional() @IsString()
  LightSource?: string;

  @IsOptional() @IsString()
  Remark?: string;

  @Transform(({ value }) => Number(value))
  @IsNumber() costPrice: number;

  @Transform(({ value }) => Number(value))
  @IsNumber() sellingPrice: number;

  @Transform(({ value }) => Number(value))
  @IsNumber() retailPrice: number;

  @IsString() category: string;

  @Transform(({ value }) => Number(value))
  @IsNumber() totalQuantity: number;

  @IsOptional()
  @Transform(({ value }) => parseOptionalNumber(value))
  @IsNumber()
  salesCount?: number;
  
  @IsOptional()
  @Transform(({ value }) => parseOptionalNumber(value))
  @IsNumber()
  weight?: number;

  @IsOptional() @IsString()
  size?: string;

  @IsOptional()
  @Transform(({ value }) => parseObject(value))
  dimension?: ProductDimensionDto;

  @IsOptional()
  @Transform(({ value }) => parseStringArray(value))
  @IsArray()
  colors?: string[];

  @IsOptional()
  @Transform(({ value }) => parseStringArray(value))
  @IsArray()
  tags?: string[];

  @IsOptional()
  @Transform(({ value }) => parseStringArray(value))
  @IsArray()
  material?: string[];

  @IsOptional()
  @Transform(({ value }) => parseStringArray(value))
  @IsArray()
  materialUsed?: string[];

  @IsOptional()
  @Transform(({ value }) => parseStringArray(value))
  @IsArray()
  existingImages?: string[];

  @IsOptional()
  @Transform(({ value }) => parseStringArray(value))
  @IsArray()
  imageOrder?: string[];

  @IsOptional() @IsString()
  primaryImage?: string;

  @IsOptional() @IsBoolean()
  @Transform(({ value }) => value !== 'false' && value !== false)
  enableCompression?: boolean;
}

export class UpdateProductDto extends CreateProductDto {
  @IsOptional() @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isActive?: boolean;
}

export class ProductQueryDto {
  @IsOptional() page?: number;
  @IsOptional() limit?: number;
  @IsOptional() category?: string;
  @IsOptional() search?: string;
  @IsOptional() minPrice?: number;
  @IsOptional() maxPrice?: number;
  @IsOptional() sortBy?: string;
  @IsOptional() order?: 'asc' | 'desc';
}
