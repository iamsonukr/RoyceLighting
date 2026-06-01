import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart, CartDocument } from './schemas/cart.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async getCart(userId: string) {
    let cart = await this.cartModel.findOne({ userId: new Types.ObjectId(userId) });
    if (!cart) {
      cart = await this.cartModel.create({ userId: new Types.ObjectId(userId), items: [] });
    }
    return cart;
  }

  async addToCart(
    userId: string,
    productId: string,
    quantity: number,
    color?: string,
    size?: string,
  ) {
    const product = await this.productModel.findById(productId);
    if (!product) throw new NotFoundException('Product not found');

    let cart = await this.cartModel.findOne({ userId: new Types.ObjectId(userId) });
    if (!cart) {
      cart = await this.cartModel.create({ userId: new Types.ObjectId(userId), items: [] });
    }

    // Check if item already in cart (same product + color + size)
    const key = (i: any) =>
      i.productId === productId && i.color === (color || '') && i.size === (size || '');

    const existingIdx = cart.items.findIndex(key);

    if (existingIdx > -1) {
      cart.items[existingIdx].quantity += quantity;
    } else {
      (cart.items as any[]).push({
        productId,
        name: product.name,
        price: product.sellingPrice,
        quantity,
        color: color || '',
        size: size || '',
        image: product.images?.[0] || product.image,
      });
    }

    await cart.save();
    return cart;
  }

  async updateCartItem(
    userId: string,
    productId: string,
    quantity: number,
    color?: string,
    size?: string,
  ) {
    const cart = await this.cartModel.findOne({ userId: new Types.ObjectId(userId) });
    if (!cart) throw new NotFoundException('Cart not found');

    const key = (i: any) =>
      i.productId === productId && i.color === (color || '') && i.size === (size || '');

    const idx = cart.items.findIndex(key);
    if (idx === -1) throw new NotFoundException('Item not found in cart');

    if (quantity <= 0) {
      cart.items.splice(idx, 1);
    } else {
      cart.items[idx].quantity = quantity;
    }

    await cart.save();
    return cart;
  }

  async removeFromCart(userId: string, productId: string, color?: string, size?: string) {
    const cart = await this.cartModel.findOne({ userId: new Types.ObjectId(userId) });
    if (!cart) throw new NotFoundException('Cart not found');

    cart.items = (cart.items as any[]).filter(
      (i) =>
        !(
          i.productId === productId &&
          i.color === (color || '') &&
          i.size === (size || '')
        ),
    ) as any;

    await cart.save();
    return cart;
  }

  async clearCart(userId: string) {
    await this.cartModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      { items: [] },
    );
    return { message: 'Cart cleared' };
  }
}
