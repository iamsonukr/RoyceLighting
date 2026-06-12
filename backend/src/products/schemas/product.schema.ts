import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductDocument = Product & Document;

// ─── Sub-schemas ────────────────────────────────────────────────────────────

export class ProductDimension {
  height?: string;  // e.g. "290mm"
  width?: string;   // e.g. "600mm"
  depth?: string;   // e.g. "180mm"
  raw: string;      // original string from catalog: "1200*180*H290"
}

export class ProductImageAsset {
  url: string;
  webpUrl?: string;
  originalName?: string;
  mimeType?: string;
  size?: number;    // file size in bytes
  width?: number;   // image width in px
  height?: number;  // image height in px
  order: number;
  isPrimary: boolean;
}

// ─── Main Schema ─────────────────────────────────────────────────────────────

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Product {

  // ── Identity ───────────────────────────────────────────────────────────────

  @Prop({ required: true, trim: true })
  name: string;
  // Model No. as display name: "RL188093-600D"

  @Prop({ required: true, trim: true, unique: true, lowercase: true })
  slug: string;
  // URL-safe identifier derived from name: "rl188093-600d"

  @Prop({ required: true, trim: true, unique: true })
  sku: string;
  // Catalog Model No.: "RL188093-600D" (renamed from productId)

  @Prop({ trim: true })
  series?: string;
  // Product family extracted from SKU prefix: "RL188093"
  // Enables "More from this series" on PDP

  // ── Content ────────────────────────────────────────────────────────────────
  @Prop({ required: true })
  description: string;

  @Prop({ type: [String], default: [] })
  tags: string[];
  // ── Classification ─────────────────────────────────────────────────────────

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  category: Types.ObjectId;

  // ── Pricing ────────────────────────────────────────────────────────────────

  @Prop({ required: true, default: 0 })
  costPrice: number;

  @Prop({ required: true, default: 0 })
  sellingPrice: number;

  @Prop({ required: true, default: 0 })
  retailPrice: number;

  // ── Inventory ──────────────────────────────────────────────────────────────

  @Prop({ required: true, min: 0, default: 999 })
  totalQuantity: number;

  @Prop({ default: 0 })
  salesCount: number;

  // ── Physical Attributes ────────────────────────────────────────────────────

  @Prop({ trim: true })
  size?: string;
  // Raw size string from catalog: "1200*180*H290", "Ø500*H500"

  @Prop({ type: Object })
  dimension?: ProductDimension;
  // Parsed from size: { height: "290mm", width: "1200mm", depth: "180mm", raw: "1200*180*H290" }

  @Prop({ default: 0, min: 0 })
  weight?: number;
  // Weight in grams

  @Prop({ type: [String], default: [] })
  material: string[];
  // Split from catalog MATERIAL field: ["STAINLESS STEEL", "ACRYLIC", "CRYSTAL"]

  @Prop({ type: [String], default: [] })
  colors: string[];
  // Split from catalog FINISHED field: ["CHROME", "PINK"]

  @Prop({ trim: true })
  finish?: string;
  // Raw finish string from catalog: "CHROME+PINK" (fixed typo from Fineshed)

  @Prop({ trim: true })
  lightSource?: string;
  // e.g. "LED 3IN1 3K/4K/6K", "E14*7", "GU10"

  @Prop({ default: 0, min: 0 })
  watt?: number;

  @Prop({ trim: true })
  inputVoltage?: string;

  @Prop({ default: 0, min: 0 })
  lmPerW?: number;

  @Prop({ default: 0, min: 0 })
  fluxLumin?: number;

  @Prop({ default: 0, min: 0 })
  ra?: number;

  @Prop({ trim: true })
  chipBrand?: string;

  @Prop({ default: 0, min: 0 })
  pf?: number;

  @Prop({ trim: true })
  cutSize?: string;

  @Prop({ default: 0, min: 0 })
  beamAngle?: number;

  @Prop({ trim: true })
  ipRate?: string;

  @Prop({ trim: true })
  remark?: string;
  // Any extra notes from catalog

  // ── Images ─────────────────────────────────────────────────────────────────

  @Prop({ type: [Object], default: [] })
  imageAssets: ProductImageAsset[];
  // Single source of truth for all product images.
  // Use isPrimary: true on one asset as the primary image.
  // Derive primaryImageUrl via a virtual if needed (see below).

  // ── Relations ──────────────────────────────────────────────────────────────

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  vendorId?: Types.ObjectId;
  // null = admin-owned product

  // ── Status ─────────────────────────────────────────────────────────────────

  @Prop({ default: true })
  isActive: boolean;
}

// ─── Schema & Indexes ────────────────────────────────────────────────────────

export const ProductSchema = SchemaFactory.createForClass(Product);

const getOrderedImageAssets = (assets?: ProductImageAsset[]) =>
  Array.isArray(assets)
    ? [...assets].sort((a, b) => Number(a.order ?? 0) - Number(b.order ?? 0))
    : [];

const getDisplayImage = (asset?: ProductImageAsset) => asset?.webpUrl || asset?.url || null;

// Virtual: derive image URLs from imageAssets without storing duplicate fields.
ProductSchema.virtual('images').get(function (this: Product) {
  return getOrderedImageAssets(this.imageAssets)
    .map((asset) => getDisplayImage(asset))
    .filter(Boolean);
});

ProductSchema.virtual('primaryImage').get(function (this: Product) {
  const assets = getOrderedImageAssets(this.imageAssets);
  const primary = assets.find((asset) => asset.isPrimary) || assets[0];
  return getDisplayImage(primary);
});

ProductSchema.virtual('image').get(function (this: Product) {
  const assets = getOrderedImageAssets(this.imageAssets);
  const primary = assets.find((asset) => asset.isPrimary) || assets[0];
  return getDisplayImage(primary);
});

// Full-text search index
ProductSchema.index({ name: 'text', description: 'text', tags: 'text', sku: 'text' });

// Fast lookups
ProductSchema.index({ category: 1 });
ProductSchema.index({ series: 1 });
ProductSchema.index({ isActive: 1 });
ProductSchema.index({ sellingPrice: 1 });
ProductSchema.index({ salesCount: -1 });
