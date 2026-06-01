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
import sharp from 'sharp';

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
    const payload: any = { ...dto };
    if (dto.category) payload.category = await this.resolveCategory(dto.category);

    const orderedAssets = this.resolveImageAssets([], uploadedAssets, dto);
    payload.imageAssets = orderedAssets;
    payload.images = orderedAssets.map((asset) => this.getDisplayImage(asset));
    payload.primaryImage = this.getPrimaryImage(orderedAssets);
    payload.image = payload.primaryImage || payload.images[0] || null;
    payload.vendorId = vendorId ? new Types.ObjectId(vendorId) : null;

    if ((dto as any).materialUsed) payload.material = (dto as any).materialUsed;
    if ((dto as any).size) payload.dimension = (dto as any).size;
    if ((dto as any).colors) payload.colors = (dto as any).colors;
    this.stripImageDtoFields(payload);

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

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortField: any = { [sortBy]: sortOrder };

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

  async findOne(id: string) {
    const product = await this.productModel.findById(id).populate('category', 'name slug');
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

    const updateData: any = { ...dto };
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
      updateData.images = nextAssets.map((asset) => this.getDisplayImage(asset));
      updateData.primaryImage = this.getPrimaryImage(nextAssets);
      updateData.image = updateData.primaryImage || updateData.images[0] || null;
    }

    if (updateData.category) updateData.category = await this.resolveCategory(updateData.category);
    if ((updateData as any).materialUsed) updateData.material = (updateData as any).materialUsed;
    if ((updateData as any).size) updateData.dimension = (updateData as any).size;
    if ((updateData as any).colors) updateData.colors = (updateData as any).colors;
    this.stripImageDtoFields(updateData);

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

    const paths = [...(product.images || []), product.image].filter(Boolean) as string[];
    return [...new Set(paths)].map((url, index) => ({
      url,
      order: index,
      isPrimary: url === (product.primaryImage || product.image || paths[0]),
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

  private getPrimaryImage(assets: ProductImageAsset[]) {
    const primary = assets.find((asset) => asset.isPrimary) || assets[0];
    return primary ? this.getDisplayImage(primary) : null;
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

  private stripImageDtoFields(payload: any) {
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
