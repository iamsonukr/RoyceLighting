import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { VendorService } from './vendor.service';
import { JwtAuthGuard, VendorGuard } from '../auth/guards/auth.guard';

@UseGuards(JwtAuthGuard, VendorGuard)
@Controller('vendor')
export class VendorController {
  constructor(private vendorService: VendorService) {}

  @Get('dashboard')
  async getDashboard(@Request() req) {
    const data = await this.vendorService.getDashboardStats(req.user._id);
    return { success: true, data };
  }

  @Get('orders')
  async getOrders(
    @Request() req,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    const data = await this.vendorService.getVendorOrders(req.user._id, +page, +limit);
    return { success: true, data };
  }
}
