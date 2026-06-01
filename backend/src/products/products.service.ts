import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto, UpdateProductDto, ProductQueryDto } from './dto/product.dto';
import { UserRole } from '../users/schemas/user.schema';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async create(dto: CreateProductDto, imagePaths: string[] = [], vendorId?: string) {
    const payload: any = { ...dto };
    // convert category to ObjectId if provided
    if (dto.category) payload.category = new Types.ObjectId(dto.category);
    payload.images = imagePaths;
    payload.image = imagePaths[0] || null;
    payload.vendorId = vendorId ? new Types.ObjectId(vendorId) : null;

    // map DTO fields to schema fields when names differ
    if ((dto as any).materialUsed) payload.material = (dto as any).materialUsed;
    if ((dto as any).size) payload.dimension = (dto as any).size;
    if ((dto as any).colors) payload.colors = (dto as any).colors;

    const product = await this.productModel.create(payload);
    return product;
  }

  async findAll(query: ProductQueryDto) {
    const {
      page = 1, limit = 20, category, search,
      minPrice, maxPrice, sortBy = 'createdAt', order = 'desc',
    } = query;

    const filter: any = { isActive: true };

    if (category) {
      try {
        filter.category = new Types.ObjectId(category);
      } catch (e) {
        // invalid id — leave filter so no matches
        filter.category = null;
      }
    }
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
    if (!product || !product.isActive)
      throw new NotFoundException('Product not found');
    return product;
  }

  async update(
    id: string,
    dto: UpdateProductDto,
    imagePaths?: string[],
    userId?: string,
    role?: string,
  ) {
    const product = await this.productModel.findById(id);
    if (!product) throw new NotFoundException('Product not found');

    // Vendors can only edit their own products
    if (role === UserRole.VENDOR && String(product.vendorId) !== userId) {
      throw new ForbiddenException('You can only edit your own products');
    }

    const updateData: any = { ...dto };
    if (imagePaths?.length) {
      this.removeImageFiles([...(product.images || []), product.image].filter(Boolean) as string[]);
      updateData.images = imagePaths;
      updateData.image = imagePaths[0];
    }

    // convert category id to ObjectId if provided
    if (updateData.category) {
      try { updateData.category = new Types.ObjectId(updateData.category); } catch (e) { /* ignore invalid id */ }
    }

    // map DTO fields to schema fields when names differ
    if ((updateData as any).materialUsed) updateData.material = (updateData as any).materialUsed;
    if ((updateData as any).size) updateData.dimension = (updateData as any).size;
    if ((updateData as any).colors) updateData.colors = (updateData as any).colors;

    return this.productModel.findByIdAndUpdate(id, updateData, { new: true });
  }

  async remove(id: string, userId?: string, role?: string) {
    const product = await this.productModel.findById(id);
    if (!product) throw new NotFoundException('Product not found');

    if (role === UserRole.VENDOR && String(product.vendorId) !== userId) {
      throw new ForbiddenException('You can only delete your own products');
    }

    this.removeImageFiles([...(product.images || []), product.image].filter(Boolean) as string[]);

    await this.productModel.findByIdAndDelete(id);
    return { message: 'Product deleted successfully' };
  }

  // Admin: get all products including inactive
  async findAllAdmin(query: ProductQueryDto & { vendorId?: string }) {
    const filter: any = {};
    if (query.category) filter.category = query.category;
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

  // Vendor: get own products
  async findVendorProducts(vendorId: string, query: ProductQueryDto) {
    const filter: any = { vendorId: new Types.ObjectId(vendorId) };
    if (query.category) {
      try { filter.category = new Types.ObjectId(query.category); } catch (e) { filter.category = null; }
    }

    return this.productModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(((+query.page || 1) - 1) * (+query.limit || 20))
      .limit(+query.limit || 20);
  }

  async getFeatured(limit = 8) {
    return this.productModel
      .find({ isActive: true })
      .sort({ salesCount: -1 })
      .limit(limit);
  }

  async getByCategory(category: string, limit = 12) {
    const filter: any = { isActive: true };
    try { filter.category = new Types.ObjectId(category); } catch (e) { filter.category = null; }
    return this.productModel
      .find(filter)
      .sort({ salesCount: -1 })
      .limit(limit)
      .populate('category', 'name slug');
  }

  private removeImageFiles(imagePaths: string[]) {
    [...new Set(imagePaths)].forEach((imagePath) => {
      const oldPath = path.join(process.cwd(), 'uploads', path.basename(imagePath));
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    });
  }
}
