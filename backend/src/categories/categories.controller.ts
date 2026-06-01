import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './category.dto';
import { JwtAuthGuard, AdminGuard } from '../auth/guards/auth.guard';

const multerOptions = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = join(process.cwd(), 'uploads');
      if (!existsSync(uploadPath)) mkdirSync(uploadPath, { recursive: true });
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `category-${unique}${extname(file.originalname)}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp|svg\+xml)$/)) {
      return cb(new Error('Only image files are allowed'), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
};

@Controller('categories')
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  // ─── Public ───────────────────────────────────────────────

  /** All active categories — used by website nav, shop filters */
  @Get()
  async findAll() {
    const data = await this.categoriesService.findAllActive();
    return { success: true, data };
  }

  /** Single active category by slug */
  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    const data = await this.categoriesService.findBySlug(slug);
    return { success: true, data };
  }

  // ─── Admin ────────────────────────────────────────────────

  /** All categories including inactive — admin panel only */
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('admin/all')
  async findAllAdmin(@Query('page') page?: string, @Query('limit') limit?: string) {
    if (page) {
      const data = await this.categoriesService.findAllPaginated(Number(page), limit ? Number(limit) : undefined);
      return { success: true, data };
    }
    const data = await this.categoriesService.findAll();
    return { success: true, data };
  }

  /** Seed default categories (run once) */
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('admin/seed')
  async seed() {
    const data = await this.categoriesService.seed();
    return { success: true, ...data };
  }

  /** Bulk reorder */
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch('admin/reorder')
  async reorder(@Body() body: { items: { id: string; sortOrder: number }[] }) {
    const data = await this.categoriesService.reorder(body.items);
    return { success: true, ...data };
  }

  /** Create new category */
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post()
  @UseInterceptors(FileInterceptor('image', multerOptions))
  async create(
    @Body() dto: CreateCategoryDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const imagePath = file ? `/uploads/${file.filename}` : undefined;
    const data = await this.categoriesService.create(dto, imagePath);
    return { success: true, message: 'Category created', data };
  }

  /** Update category */
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Put(':id')
  @UseInterceptors(FileInterceptor('image', multerOptions))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const imagePath = file ? `/uploads/${file.filename}` : undefined;
    const data = await this.categoriesService.update(id, dto, imagePath);
    return { success: true, message: 'Category updated', data };
  }

  /** Toggle active/inactive */
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch(':id/toggle')
  async toggleActive(@Param('id') id: string) {
    const data = await this.categoriesService.toggleActive(id);
    return { success: true, data };
  }

  /** Delete category */
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const data = await this.categoriesService.remove(id);
    return { success: true, ...data };
  }
}