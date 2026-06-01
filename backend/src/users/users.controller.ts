import { Controller, Get, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard, AdminGuard } from '../auth/guards/auth.guard';

@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  async findAll(@Query('role') role?: string, @Query('page') page?: string, @Query('limit') limit?: string) {
    // If page/limit provided, usersService will return paginated object, otherwise array
    const data = await this.usersService.findAll(role, page ? Number(page) : undefined, limit ? Number(limit) : undefined);
    return { success: true, data };
  }

  @Get('vendors')
  async getVendors() {
    const data = await this.usersService.getVendors();
    return { success: true, data };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.usersService.findOne(id);
    return { success: true, data };
  }

  @Patch(':id/toggle-active')
  async toggleActive(@Param('id') id: string) {
    const data = await this.usersService.toggleActive(id);
    return { success: true, data };
  }
}
