import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateProductDto {
  @IsString() name: string;
  @IsString() description: string;

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
  
  @IsOptional() @IsString() weight?: string;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? JSON.parse(value) : value,
  )
  colors?: string[];

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? JSON.parse(value) : value,
  )
  size?: { height: string; width: string };

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? JSON.parse(value) : value,
  )
  tags?: string[];

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? JSON.parse(value) : value,
  )
  materialUsed?: string[];

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? JSON.parse(value) : value,
  )
  existingImages?: string[];

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? JSON.parse(value) : value,
  )
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
