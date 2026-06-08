import {
  Controller, Get, Post, Put, Delete, Body, Param, Query,
  UseGuards, Request, UseInterceptors, UploadedFiles,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto, ProductQueryDto } from './dto/product.dto';
import { JwtAuthGuard, AdminGuard, VendorGuard } from '../auth/guards/auth.guard';

const multerOptions = {
  storage: memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
      return cb(new Error('Only image files are allowed'), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 10 * 1024 * 1024 },
};

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  // ─── Public routes ───────────────────────────────────────
  @Get()
  async findAll(@Query() query: ProductQueryDto) {
    const data = await this.productsService.findAll(query);
    return { success: true, data };
  }

  @Get('featured')
  async getFeatured(@Query('limit') limit = 8) {
    const data = await this.productsService.getFeatured(+limit);
    return { success: true, data };
  }

  @Get('category/:category')
  async getByCategory(
    @Param('category') category: string,
    @Query('limit') limit = 12,
  ) {
    const data = await this.productsService.getByCategory(category, +limit);
    return { success: true, data };
  }

  // ─── Admin routes ────────────────────────────────────────
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('admin/all')
  async findAllAdmin(@Query() query: ProductQueryDto) {
    const data = await this.productsService.findAllAdmin(query);
    return { success: true, data };
  }

  // ─── Admin + Vendor: add product ─────────────────────────
  @UseGuards(JwtAuthGuard, VendorGuard)
  @Post()
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'image', maxCount: 1 },
    { name: 'images', maxCount: 8 },
  ], multerOptions))
  async create(
    @Body() dto: CreateProductDto,
    @UploadedFiles() files: { image?: Express.Multer.File[]; images?: Express.Multer.File[] },
    @Request() req,
  ) {
    const uploadedFiles = [...(files?.images || []), ...(files?.image || [])];
    const uploadedAssets = await this.productsService.optimizeUploadedImages(
      uploadedFiles,
      dto.enableCompression !== false,
    );
    const vendorId = req.user.role === 'vendor' ? req.user._id : undefined;
    const data = await this.productsService.create(dto, uploadedAssets, vendorId);
    return { success: true, message: 'Product created', data };
  }

  @UseGuards(JwtAuthGuard, VendorGuard)
  @Put(':id')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'image', maxCount: 1 },
    { name: 'images', maxCount: 8 },
  ], multerOptions))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @UploadedFiles() files: { image?: Express.Multer.File[]; images?: Express.Multer.File[] },
    @Request() req,
  ) {
    const uploadedFiles = [...(files?.images || []), ...(files?.image || [])];
    const uploadedAssets = await this.productsService.optimizeUploadedImages(
      uploadedFiles,
      dto.enableCompression !== false,
    );
    const data = await this.productsService.update(
      id, dto, uploadedAssets, req.user._id, req.user.role,
    );
    return { success: true, message: 'Product updated', data };
  }

  @UseGuards(JwtAuthGuard, VendorGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    const data = await this.productsService.remove(id, req.user._id, req.user.role);
    return { success: true, ...data };
  }

  // ─── Vendor: own products ────────────────────────────────
  @UseGuards(JwtAuthGuard, VendorGuard)
  @Get('vendor/my-products')
  async vendorProducts(@Request() req, @Query() query: ProductQueryDto) {
    const data = await this.productsService.findVendorProducts(req.user._id, query);
    return { success: true, data };
  }

  @Get(':idOrSlug')
  async findOne(@Param('idOrSlug') idOrSlug: string) {
    const data = await this.productsService.findOne(idOrSlug);
    return { success: true, data };
  }
}
