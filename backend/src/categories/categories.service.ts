import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './category.schema';
import { CreateCategoryDto, UpdateCategoryDto } from './category.dto';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  // ─── Helpers ──────────────────────────────────────────────
  private toSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  // ─── Public: all active categories ────────────────────────
  async findAllActive(): Promise<Category[]> {
    return this.categoryModel
      .find({ isActive: true })
      .sort({ sortOrder: 1, name: 1 });
  }

  // ─── Public: single by slug ───────────────────────────────
  async findBySlug(slug: string): Promise<Category> {
    const category = await this.categoryModel.findOne({ slug, isActive: true });
    if (!category) throw new NotFoundException(`Category "${slug}" not found`);
    return category;
  }

  // ─── Admin: all categories ────────────────────────────────
  async findAll(): Promise<Category[]> {
    return this.categoryModel.find().sort({ sortOrder: 1, name: 1 });
  }

  // ─── Admin: paginated categories (optional)
  async findAllPaginated(page = 1, limit = 20) {
    const pageNum = +page || 1;
    const lim = +limit || 20;
    const [categories, total] = await Promise.all([
      this.categoryModel.find().sort({ sortOrder: 1, name: 1 }).skip((pageNum - 1) * lim).limit(lim),
      this.categoryModel.countDocuments(),
    ]);
    return { categories, total, page: pageNum, pages: Math.ceil(total / lim) };
  }

  // ─── Admin: find by ID ────────────────────────────────────
  async findById(id: string): Promise<Category> {
    const category = await this.categoryModel.findById(id);
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  // ─── Admin: create ────────────────────────────────────────
  async create(dto: CreateCategoryDto, imagePath?: string): Promise<Category> {
    const slug = dto.slug ? this.toSlug(dto.slug) : this.toSlug(dto.name);

    const existing = await this.categoryModel.findOne({
      $or: [{ slug }, { name: dto.name }],
    });
    if (existing) {
      throw new ConflictException(
        `Category with name "${dto.name}" or slug "${slug}" already exists`,
      );
    }

    const category = await this.categoryModel.create({
      name: dto.name,
      slug,
      description: dto.description,
      emoji: dto.emoji,
      sortOrder: dto.sortOrder ?? 0,
      image: imagePath || null,
      isActive: true,
    });

    return category;
  }

  // ─── Admin: update ────────────────────────────────────────
  async update(
    id: string,
    dto: UpdateCategoryDto,
    imagePath?: string,
  ): Promise<Category> {
    const category = await this.categoryModel.findById(id);
    if (!category) throw new NotFoundException('Category not found');

    // Check slug/name uniqueness if being changed
    if (dto.name || dto.slug) {
      const newSlug = dto.slug
        ? this.toSlug(dto.slug)
        : dto.name
        ? this.toSlug(dto.name)
        : category.slug;

      const conflict = await this.categoryModel.findOne({
        _id: { $ne: id },
        $or: [
          ...(dto.name ? [{ name: dto.name }] : []),
          { slug: newSlug },
        ],
      });
      if (conflict) {
        throw new ConflictException('Another category with that name or slug already exists');
      }
      if (dto.name) dto.slug = newSlug;
    }

    const updateData: any = { ...dto };

    // Replace image file if new one uploaded
    if (imagePath) {
      if (category.image) {
        const oldPath = path.join(process.cwd(), 'uploads', path.basename(category.image));
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      updateData.image = imagePath;
    }
    return this.categoryModel.findByIdAndUpdate(id, updateData, { new: true });
  }

  // ─── Admin: toggle active ─────────────────────────────────
  async toggleActive(id: string): Promise<Category> {
    const category = await this.categoryModel.findById(id);
    if (!category) throw new NotFoundException('Category not found');
    category.isActive = !category.isActive;
    await category.save();
    return category;
  }

  // ─── Admin: delete ────────────────────────────────────────
  async remove(id: string): Promise<{ message: string }> {
    const category = await this.categoryModel.findById(id);
    if (!category) throw new NotFoundException('Category not found');

    // Remove image file if present
    if (category.image) {
      const imgPath = path.join(process.cwd(), 'uploads', path.basename(category.image));
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    await this.categoryModel.findByIdAndDelete(id);
    return { message: `Category "${category.name}" deleted` };
  }

  // ─── Admin: reorder ───────────────────────────────────────
  async reorder(items: { id: string; sortOrder: number }[]): Promise<{ message: string }> {
    await Promise.all(
      items.map(({ id, sortOrder }) =>
        this.categoryModel.findByIdAndUpdate(id, { sortOrder }),
      ),
    );
    return { message: 'Sort order updated' };
  }

  // ─── Seed default categories ──────────────────────────────
  async seed(): Promise<{ message: string; created: number }> {
      const defaults = [
    { name: 'Wall Lights',              slug: 'wall-lights',              emoji: '💡', sortOrder: 1 },
    { name: 'Hanging Lights',           slug: 'hanging-lights',           emoji: '🏮', sortOrder: 2 },
    { name: 'Chandeliers',              slug: 'chandeliers',              emoji: '✨', sortOrder: 3 },
    { name: 'Table Lamps',              slug: 'table-lamps',              emoji: '🛋️', sortOrder: 4 },
    { name: 'Floor Lamps',              slug: 'floor-lamps',              emoji: '🪔', sortOrder: 5 },
    { name: 'Outdoor Lights',           slug: 'outdoor-lights',           emoji: '🌳', sortOrder: 6 },
    { name: 'Facade Lights',            slug: 'facade-lights',            emoji: '🏢', sortOrder: 7 },
    { name: 'Garden Lights',            slug: 'garden-lights',            emoji: '🌿', sortOrder: 8 },
    { name: 'LED Spotlights',           slug: 'led-spotlights',           emoji: '🔦', sortOrder: 9 },
    { name: 'Magnetic Track Lights',    slug: 'magnetic-track-lights',    emoji: '🛤️', sortOrder: 10 },
    { name: 'Profile Lights',           slug: 'profile-lights',           emoji: '📏', sortOrder: 11 },
    { name: 'LED Strip Lights',         slug: 'led-strip-lights',         emoji: '🌈', sortOrder: 12 },
    { name: 'Ceiling Fans',             slug: 'ceiling-fans',             emoji: '🌀', sortOrder: 13 },
    { name: 'Mirror Lights',            slug: 'mirror-lights',            emoji: '🪞', sortOrder: 14 },
    { name: 'Fairy Lights',             slug: 'fairy-lights',             emoji: '🎇', sortOrder: 15 },
    { name: 'Solar Lights',             slug: 'solar-lights',             emoji: '☀️', sortOrder: 16 },
    { name: 'Decor Lights',             slug: 'decor-lights',             emoji: '🏠', sortOrder: 17 },
    { name: 'Artifacts',                slug: 'artifacts',                emoji: '🗿', sortOrder: 18 },
    { name: 'Furniture',                slug: 'furniture',                emoji: '🪑', sortOrder: 19 },
    { name: 'Other',                    slug: 'other',                    emoji: '🛍️', sortOrder: 20 },
  ];

    let created = 0;
    for (const cat of defaults) {
      const exists = await this.categoryModel.findOne({ slug: cat.slug });
      if (!exists) {
        await this.categoryModel.create({ ...cat, isActive: true });
        created++;
      }
    }

    return { message: `Seeded ${created} categories`, created };
  }
}