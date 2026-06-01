import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema({ timestamps: true })
export class Category {
  @Prop({ required: true, trim: true, unique: true })
  name: string; // display name: "Hair Accessories"

  @Prop({ required: true, trim: true, unique: true, lowercase: true })
  slug: string; // url-safe: "hair-accessories"

  @Prop({ trim: true })
  description?: string;

  @Prop({ trim: true })
  image?: string; // optional category banner/icon

  @Prop({ trim: true })
  emoji?: string; // e.g. "💎"

  @Prop({ default: 0 })
  sortOrder: number; // controls display order

  @Prop({ default: true })
  isActive: boolean;
}

export const CategorySchema = SchemaFactory.createForClass(Category);