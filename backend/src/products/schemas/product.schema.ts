import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductDocument = Product & Document;

export class ProductImageAsset {
  url: string;
  webpUrl?: string;
  originalName?: string;
  mimeType?: string;
  size?: number;
  width?: number;
  height?: number;
  order: number;
  isPrimary: boolean;
}

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  costPrice: number;

  @Prop({ required: true })
  sellingPrice: number;

  @Prop({ required: true })
  retailPrice: number;

  // Reference to Category collection for dynamic categories
  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  category: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  totalQuantity: number;

  @Prop({ type: Object })
  dimension: { height: string; width: string };

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: [String], default: [] })
  material: string[];

  @Prop({ type: [String], default: [] })
  colors?: string[];

  @Prop({ trim: true })
  weight?: string;

  // Can be local path or URL
  @Prop({ trim: true })
  image?: string;

  @Prop({ type: [String], default: [] })
  images?: string[];

  @Prop({ trim: true })
  primaryImage?: string;

  @Prop({ type: [Object], default: [] })
  imageAssets?: ProductImageAsset[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  productId: string;

  @Prop()
  Fineshed: string;
  
  @Prop()
  LightSource: string;

  @Prop()
  Remark: string;

  // Vendor reference (null = admin-owned product)
  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  vendorId?: Types.ObjectId;

  @Prop({ default: 0 })
  salesCount: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

// Text index for search
ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });
