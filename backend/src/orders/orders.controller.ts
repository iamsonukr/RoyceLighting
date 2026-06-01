import {
  Controller, Get, Post, Patch, Body, Param, Query,
  UseGuards, Request,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';
import { JwtAuthGuard, AdminGuard } from '../auth/guards/auth.guard';

@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  // Create Razorpay order (pre-payment)
  @UseGuards(JwtAuthGuard)
  @Post('create-razorpay-order')
  async createRazorpayOrder(@Body('amount') amount: number) {
    const data = await this.ordersService.createRazorpayOrder(amount);
    return { success: true, data };
  }

  // Place order after payment
  @UseGuards(JwtAuthGuard)
  @Post('place')
  async placeOrder(@Request() req, @Body() dto: CreateOrderDto) {
    const data = await this.ordersService.placeOrder(req.user._id, dto);
    return { success: true, message: 'Order placed successfully', data };
  }

  // My orders (customer)
  @UseGuards(JwtAuthGuard)
  @Get('my-orders')
  async getMyOrders(@Request() req) {
    const data = await this.ordersService.getUserOrders(req.user._id);
    return { success: true, data };
  }

  // Track single order
  @UseGuards(JwtAuthGuard)
  @Get(':id/track')
  async trackOrder(@Param('id') id: string) {
    const data = await this.ordersService.trackOrder(id);
    return { success: true, data };
  }

  // Get single order
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getOrder(@Param('id') id: string, @Request() req) {
    const data = await this.ordersService.getOrder(id, req.user._id, req.user.role);
    return { success: true, data };
  }

  // ─── Admin routes ───────────────────────────────────────
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('admin/all')
  async getAllOrders(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('status') status?: string,
  ) {
    const data = await this.ordersService.getAllOrders(+page, +limit, status);
    return { success: true, data };
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('admin/stats')
  async getStats() {
    const data = await this.ordersService.getOrderStats();
    return { success: true, data };
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch('admin/:id/status')
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    const data = await this.ordersService.updateOrderStatus(id, dto);
    return { success: true, message: 'Order status updated', data };
  }
}
