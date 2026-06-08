import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument, ProductImageAsset } from './schemas/product.schema';
import { Category, CategoryDocument } from '../categories/category.schema';
import { CreateProductDto, UpdateProductDto, ProductQueryDto } from './dto/product.dto';
import { UserRole } from '../users/schemas/user.schema';
import * as fs from 'fs';
import * as path from 'path';
import * as sharp from 'sharp';

const MAX_OPTIMIZED_IMAGE_SIZE = 500 * 1024;

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  async optimizeUploadedImages(
    files: Express.Multer.File[] = [],
    enableCompression = true,
  ): Promise<ProductImageAsset[]> {
    const assets: ProductImageAsset[] = [];

    for (const [index, file] of files.entries()) {
      if (!file.mimetype.match(/^image\/(jpe?g|png|gif|webp)$/)) {
        throw new BadRequestException('Only JPG, PNG, GIF, and WEBP images are allowed');
      }

      assets.push(
        enableCompression
          ? await this.writeOptimizedImage(file, index)
          : await this.writeOriginalImage(file, index),
      );
    }

    return assets;
  }

  async create(dto: CreateProductDto, uploadedAssets: ProductImageAsset[] = [], vendorId?: string) {
    const payload = await this.buildProductPayload(dto, true);

    const orderedAssets = this.resolveImageAssets([], uploadedAssets, dto);
    payload.imageAssets = orderedAssets;
    payload.vendorId = vendorId ? new Types.ObjectId(vendorId) : null;

    return this.productModel.create(payload);
  }

  async findAll(query: ProductQueryDto) {
    const {
      page = 1,
      limit = 20,
      category,
      search,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      order = 'desc',
    } = query;

    const filter: any = { isActive: true };
    if (category) filter.category = await this.resolveCategoryFilter(category);
    if (search) filter.$text = { $search: search };
    if (minPrice || maxPrice) {
      filter.sellingPrice = {};
      if (minPrice) filter.sellingPrice.$gte = +minPrice;
      if (maxPrice) filter.sellingPrice.$lte = +maxPrice;
    }

    const sortField = this.resolveSort(sortBy, order);

    const [products, total] = await Promise.all([
      this.productModel
        .find(filter)
        .populate('category', 'name slug')
        .sort(sortField)
        .skip((+page - 1) * +limit)
        .limit(+limit),
      this.productModel.countDocuments(filter),
    ]);

    return { products, total, page: +page, pages: Math.ceil(total / +limit) };
  }

  async findOne(idOrSlug: string) {
    const filter = Types.ObjectId.isValid(idOrSlug)
      ? { _id: new Types.ObjectId(idOrSlug) }
      : { slug: idOrSlug };
    const product = await this.productModel.findOne(filter).populate('category', 'name slug');
    if (!product || !product.isActive) throw new NotFoundException('Product not found');
    return product;
  }

  async update(
    id: string,
    dto: UpdateProductDto,
    uploadedAssets: ProductImageAsset[] = [],
    userId?: string,
    role?: string,
  ) {
    const product = await this.productModel.findById(id);
    if (!product) throw new NotFoundException('Product not found');

    if (role === UserRole.VENDOR && String(product.vendorId) !== userId) {
      throw new ForbiddenException('You can only edit your own products');
    }

    const updateData = await this.buildProductPayload(dto, false);
    const shouldUpdateImages =
      uploadedAssets.length > 0 ||
      Array.isArray(dto.imageOrder) ||
      Array.isArray(dto.existingImages) ||
      typeof dto.primaryImage === 'string';

    if (shouldUpdateImages) {
      const previousAssets = this.getStoredImageAssets(product);
      const nextAssets = this.resolveImageAssets(previousAssets, uploadedAssets, dto);
      const nextPaths = nextAssets.flatMap((asset) => [asset.url, asset.webpUrl].filter(Boolean) as string[]);
      const previousPaths = previousAssets.flatMap((asset) => [asset.url, asset.webpUrl].filter(Boolean) as string[]);

      this.removeImageFiles(previousPaths.filter((imagePath) => !nextPaths.includes(imagePath)));
      updateData.imageAssets = nextAssets;
    }

    return this.productModel.findByIdAndUpdate(id, updateData, { new: true });
  }

  async remove(id: string, userId?: string, role?: string) {
    const product = await this.productModel.findById(id);
    if (!product) throw new NotFoundException('Product not found');

    if (role === UserRole.VENDOR && String(product.vendorId) !== userId) {
      throw new ForbiddenException('You can only delete your own products');
    }

    this.removeImageFiles(
      this.getStoredImageAssets(product).flatMap((asset) => [asset.url, asset.webpUrl].filter(Boolean) as string[]),
    );
    await this.productModel.findByIdAndDelete(id);
    return { message: 'Product deleted successfully' };
  }

  async findAllAdmin(query: ProductQueryDto & { vendorId?: string }) {
    const filter: any = {};
    if (query.category) filter.category = await this.resolveCategoryFilter(query.category);
    if (query.search) filter.$text = { $search: query.search };
    if (query.vendorId) filter.vendorId = new Types.ObjectId(query.vendorId);
    const page = +query.page || 1;
    const limit = +query.limit || 20;

    const [products, total] = await Promise.all([
      this.productModel
        .find(filter)
        .populate('vendorId', 'name shopName email')
        .populate('category', 'name slug')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      this.productModel.countDocuments(filter),
    ]);

    return { products, total, page, pages: Math.ceil(total / limit) };
  }

  async findVendorProducts(vendorId: string, query: ProductQueryDto) {
    const filter: any = { vendorId: new Types.ObjectId(vendorId) };
    if (query.category) filter.category = await this.resolveCategoryFilter(query.category);

    return this.productModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(((+query.page || 1) - 1) * (+query.limit || 20))
      .limit(+query.limit || 20);
  }

  async getFeatured(limit = 8) {
    return this.productModel
      .find({ isActive: true })
      .populate('category', 'name slug')
      .sort({ salesCount: -1, createdAt: -1 })
      .limit(limit);
  }

  async getByCategory(category: string, limit = 12) {
    const filter: any = { isActive: true };
    filter.category = await this.resolveCategoryFilter(category);
    return this.productModel
      .find(filter)
      .sort({ salesCount: -1 })
      .limit(limit)
      .populate('category', 'name slug');
  }

  private async buildProductPayload(
    dto: CreateProductDto | UpdateProductDto,
    requireSku: boolean,
  ) {
    const payload: any = { ...dto };

    if (payload.category) payload.category = await this.resolveCategory(payload.category);

    const sku = this.cleanString(payload.sku || payload.productId);
    if (sku) {
      payload.sku = sku;
    } else if (requireSku) {
      throw new BadRequestException('SKU is required');
    }

    if (payload.slug || sku || payload.name) {
      payload.slug = this.toSlug(payload.slug || sku || payload.name);
    }

    if (sku && !this.cleanString(payload.series)) {
      payload.series = this.extractSeries(sku);
    } else if (payload.series) {
      payload.series = this.cleanString(payload.series);
    }

    if (payload.Fineshed && !payload.finish) payload.finish = payload.Fineshed;
    if (payload.LightSource && !payload.lightSource) payload.lightSource = payload.LightSource;
    if (payload.Remark && !payload.remark) payload.remark = payload.Remark;

    if (Object.prototype.hasOwnProperty.call(payload, 'material') ||
        Object.prototype.hasOwnProperty.call(payload, 'materialUsed')) {
      payload.material = this.normalizeStringArray(payload.material ?? payload.materialUsed) || [];
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'colors')) {
      payload.colors = this.normalizeStringArray(payload.colors) || [];
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'tags')) {
      payload.tags = this.normalizeStringArray(payload.tags) || [];
    }

    if (
      Object.prototype.hasOwnProperty.call(payload, 'size') ||
      Object.prototype.hasOwnProperty.call(payload, 'dimension')
    ) {
      const normalized = this.normalizeSizeAndDimension(payload.size, payload.dimension);
      if (normalized.size !== undefined) payload.size = normalized.size;
      if (normalized.dimension !== undefined) payload.dimension = normalized.dimension;
    }

    this.stripProductDtoFields(payload);
    return payload;
  }

  private normalizeStringArray(value: unknown): string[] | undefined {
    if (value === undefined || value === null) return undefined;
    if (Array.isArray(value)) {
      return value.map((item) => String(item).trim()).filter(Boolean);
    }
    if (typeof value === 'string') {
      return value.split(',').map((item) => item.trim()).filter(Boolean);
    }
    return undefined;
  }

  private normalizeSizeAndDimension(sizeValue: unknown, dimensionValue: unknown) {
    const dimensionSource =
      dimensionValue && typeof dimensionValue === 'object'
        ? dimensionValue as Record<string, unknown>
        : sizeValue && typeof sizeValue === 'object'
        ? sizeValue as Record<string, unknown>
        : undefined;

    const rawSize = typeof sizeValue === 'string'
      ? this.cleanString(sizeValue)
      : this.cleanString(dimensionSource?.raw);

    const dimension = dimensionSource
      ? {
          height: this.cleanString(dimensionSource.height),
          width: this.cleanString(dimensionSource.width),
          depth: this.cleanString(dimensionSource.depth),
          raw: this.cleanString(dimensionSource.raw) || rawSize,
        }
      : rawSize
      ? { raw: rawSize }
      : undefined;

    const cleanedDimension = dimension
      ? Object.fromEntries(
          Object.entries(dimension).filter(([, value]) => value !== undefined && value !== ''),
        )
      : undefined;

    return {
      size: rawSize,
      dimension: cleanedDimension && Object.keys(cleanedDimension).length
        ? cleanedDimension
        : undefined,
    };
  }

  private cleanString(value: unknown) {
    if (typeof value !== 'string') return undefined;
    const trimmed = value.trim();
    return trimmed || undefined;
  }

  private toSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  private extractSeries(sku: string) {
    return sku.split(/[-_\s]/)[0] || sku;
  }

  private resolveSort(sortBy = 'createdAt', order: 'asc' | 'desc' = 'desc') {
    const allowedFields = new Set([
      'createdAt',
      'name',
      'sellingPrice',
      'retailPrice',
      'salesCount',
      'totalQuantity',
      'sku',
    ]);
    const field = allowedFields.has(sortBy) ? sortBy : 'createdAt';
    const direction: 1 | -1 = order === 'asc' ? 1 : -1;
    return { [field]: direction };
  }

  private async resolveCategory(value: string) {
    if (Types.ObjectId.isValid(value)) return new Types.ObjectId(value);
    const category = await this.categoryModel.findOne({ slug: value });
    if (!category) throw new BadRequestException('Invalid category');
    return category._id;
  }

  private async resolveCategoryFilter(value: string) {
    if (Types.ObjectId.isValid(value)) return new Types.ObjectId(value);
    const category = await this.categoryModel.findOne({ slug: value, isActive: true });
    return category?._id || null;
  }

  private getStoredImageAssets(product: ProductDocument): ProductImageAsset[] {
    const assets = Array.isArray(product.imageAssets) ? product.imageAssets : [];
    if (assets.length) {
      return assets
        .map((asset, index) => ({
          ...asset,
          order: Number(asset.order ?? index),
          isPrimary: Boolean(asset.isPrimary),
        }))
        .sort((a, b) => a.order - b.order);
    }

    const legacyProduct = product as any;
    const paths = [
      ...(Array.isArray(legacyProduct.images) ? legacyProduct.images : []),
      legacyProduct.primaryImage,
      legacyProduct.image,
    ].filter(Boolean) as string[];
    return [...new Set(paths)].map((url, index) => ({
      url,
      order: index,
      isPrimary: url === (legacyProduct.primaryImage || legacyProduct.image || paths[0]),
    }));
  }

  private resolveImageAssets(
    existingAssets: ProductImageAsset[],
    uploadedAssets: ProductImageAsset[],
    dto: Pick<CreateProductDto, 'existingImages' | 'imageOrder' | 'primaryImage'>,
  ): ProductImageAsset[] {
    const existingMap = new Map<string, ProductImageAsset>();
    existingAssets.forEach((asset) => {
      [asset.url, asset.webpUrl].filter(Boolean).forEach((key) => {
        existingMap.set(this.normalizeImageToken(key as string), asset);
      });
    });

    const orderTokens = Array.isArray(dto.imageOrder) && dto.imageOrder.length
      ? dto.imageOrder
      : [
          ...(Array.isArray(dto.existingImages) ? dto.existingImages : existingAssets.map((asset) => this.getDisplayImage(asset))),
          ...uploadedAssets.map((_, index) => `new:${index}`),
        ];

    const primaryToken = dto.primaryImage ? this.normalizeImageToken(dto.primaryImage) : '';
    const used = new Set<ProductImageAsset>();
    const ordered = orderTokens
      .map((token) => {
        const normalized = this.normalizeImageToken(token);
        if (normalized.startsWith('new:')) return uploadedAssets[Number(normalized.replace('new:', ''))];
        return existingMap.get(normalized);
      })
      .filter((asset): asset is ProductImageAsset => Boolean(asset))
      .filter((asset) => {
        if (used.has(asset)) return false;
        used.add(asset);
        return true;
      });

    uploadedAssets.forEach((asset) => {
      if (!used.has(asset)) ordered.push(asset);
    });

    if (!ordered.length) return [];
    const hasPrimary = ordered.some((asset) =>
      [asset.url, asset.webpUrl]
        .filter(Boolean)
        .some((imagePath) => this.normalizeImageToken(imagePath as string) === primaryToken),
    );

    return ordered.map((asset, index) => ({
      ...asset,
      order: index,
      isPrimary: hasPrimary
        ? [asset.url, asset.webpUrl]
            .filter(Boolean)
            .some((imagePath) => this.normalizeImageToken(imagePath as string) === primaryToken)
        : index === 0,
    }));
  }

  private getDisplayImage(asset: ProductImageAsset) {
    return asset.webpUrl || asset.url;
  }

  private normalizeImageToken(value: string) {
    if (!value) return '';
    if (value.startsWith('new:')) return value;
    try {
      return new URL(value).pathname;
    } catch {
      return value;
    }
  }

  private stripProductDtoFields(payload: any) {
    delete payload.productId;
    delete payload.Fineshed;
    delete payload.LightSource;
    delete payload.Remark;
    delete payload.materialUsed;
    delete payload.existingImages;
    delete payload.imageOrder;
    delete payload.primaryImage;
    delete payload.enableCompression;
  }

  private async writeOriginalImage(file: Express.Multer.File, order: number): Promise<ProductImageAsset> {
    const uploadPath = this.ensureUploadPath();
    const filename = `product-${Date.now()}-${Math.round(Math.random() * 1e9)}${this.safeExtension(file.originalname, file.mimetype)}`;
    await fs.promises.writeFile(path.join(uploadPath, filename), file.buffer);
    const metadata = await sharp(file.buffer).metadata().catch(() => ({} as sharp.Metadata));

    return {
      url: `/uploads/${filename}`,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      width: metadata.width,
      height: metadata.height,
      order,
      isPrimary: order === 0,
    };
  }

  private async writeOptimizedImage(file: Express.Multer.File, order: number): Promise<ProductImageAsset> {
    const uploadPath = this.ensureUploadPath();
    const baseName = `product-${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const metadata = await sharp(file.buffer).metadata();
    const candidates: Buffer[] = [];

    candidates.push(await sharp(file.buffer).rotate().webp({ lossless: true, effort: 6 }).toBuffer());

    const widths = [metadata.width || 1800, 1800, 1400, 1200, 1000, 800];
    const qualities = [92, 86, 80, 74, 68, 62, 56];
    for (const width of [...new Set(widths)].filter(Boolean)) {
      for (const quality of qualities) {
        const pipeline = sharp(file.buffer).rotate();
        if (metadata.width && metadata.width > width) {
          pipeline.resize({ width, withoutEnlargement: true });
        }
        candidates.push(await pipeline.webp({ quality, effort: 6 }).toBuffer());
      }
    }

    const underLimit = candidates.find((buffer) => buffer.length <= MAX_OPTIMIZED_IMAGE_SIZE);
    const selected = underLimit || candidates.sort((a, b) => a.length - b.length)[0];
    if (!selected || selected.length > MAX_OPTIMIZED_IMAGE_SIZE) {
      throw new BadRequestException(`${file.originalname} could not be optimized under 500 KB`);
    }

    const filename = `${baseName}.webp`;
    await fs.promises.writeFile(path.join(uploadPath, filename), selected);
    const outputMetadata = await sharp(selected).metadata();

    return {
      url: `/uploads/${filename}`,
      webpUrl: `/uploads/${filename}`,
      originalName: file.originalname,
      mimeType: 'image/webp',
      size: selected.length,
      width: outputMetadata.width,
      height: outputMetadata.height,
      order,
      isPrimary: order === 0,
    };
  }

  private ensureUploadPath() {
    const uploadPath = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    return uploadPath;
  }

  private safeExtension(originalName: string, mimeType: string) {
    const ext = path.extname(originalName).toLowerCase();
    if (ext) return ext;
    const mimeExt = mimeType.split('/')[1] || 'jpg';
    return `.${mimeExt.replace('jpeg', 'jpg')}`;
  }

  private removeImageFiles(imagePaths: string[]) {
    [...new Set(imagePaths)].forEach((imagePath) => {
      const oldPath = path.join(process.cwd(), 'uploads', path.basename(imagePath));
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    });
  }
}
