import { Controller, Get, Post, Put, Delete, Body, UseGuards, Request } from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/guards/auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private cartService: CartService) {}

  @Get()
  async getCart(@Request() req) {
    const data = await this.cartService.getCart(req.user._id);
    return { success: true, data };
  }

  @Post('add')
  async addToCart(
    @Request() req,
    @Body() body: { productId: string; quantity: number; color?: string; size?: string },
  ) {
    const data = await this.cartService.addToCart(
      req.user._id, body.productId, body.quantity, body.color, body.size,
    );
    return { success: true, data };
  }

  @Put('update')
  async updateItem(
    @Request() req,
    @Body() body: { productId: string; quantity: number; color?: string; size?: string },
  ) {
    const data = await this.cartService.updateCartItem(
      req.user._id, body.productId, body.quantity, body.color, body.size,
    );
    return { success: true, data };
  }

  @Delete('remove')
  async removeItem(
    @Request() req,
    @Body() body: { productId: string; color?: string; size?: string },
  ) {
    const data = await this.cartService.removeFromCart(
      req.user._id, body.productId, body.color, body.size,
    );
    return { success: true, data };
  }

  @Delete('clear')
  async clearCart(@Request() req) {
    const data = await this.cartService.clearCart(req.user._id);
    return { success: true, ...data };
  }
}
