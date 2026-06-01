import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';

@Injectable()
export class VendorService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async getDashboardStats(vendorId: string) {
    const vendorObjId = new Types.ObjectId(vendorId);

    const products = await this.productModel.find({ vendorId: vendorObjId });
    const productIds = products.map((p) => String(p._id));

    // Orders that contain at least one vendor product
    const orders = await this.orderModel.find({
      'items.productId': { $in: productIds },
      payment: true,
    });

    // Calculate vendor-specific revenue (only items belonging to this vendor)
    let totalRevenue = 0;
    let totalItemsSold = 0;
    const orderSet = new Set<string>();

    for (const order of orders) {
      let orderRevenue = 0;
      for (const item of order.items as any[]) {
        if (productIds.includes(item.productId)) {
          orderRevenue += item.price * item.quantity;
          totalItemsSold += item.quantity;
        }
      }
      if (orderRevenue > 0) {
        totalRevenue += orderRevenue;
        orderSet.add(String(order._id));
      }
    }

    // Low stock products
    const lowStock = products.filter((p) => p.totalQuantity <= 5).length;

    // Monthly revenue (last 6 months)
    const monthlyRevenue = await this.getMonthlyRevenue(vendorId, productIds);

    return {
      totalProducts: products.length,
      totalOrders: orderSet.size,
      totalRevenue,
      totalItemsSold,
      lowStockProducts: lowStock,
      monthlyRevenue,
    };
  }

  async getVendorOrders(vendorId: string, page = 1, limit = 20) {
    const products = await this.productModel.find({
      vendorId: new Types.ObjectId(vendorId),
    });
    const productIds = products.map((p) => String(p._id));

    const orders = await this.orderModel
      .find({ 'items.productId': { $in: productIds } })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('userId', 'name email');

    // Filter items to only vendor's products in each order
    const vendorOrders = orders.map((order) => {
      const vendorItems = (order.items as any[]).filter((item) =>
        productIds.includes(item.productId),
      );
      return {
        _id: order._id,
        status: order.status,
        orderDate: order.orderDate,
        address: order.address,
        userId: order.userId,
        vendorItems,
        vendorRevenue: vendorItems.reduce(
          (sum: number, i: any) => sum + i.price * i.quantity,
          0,
        ),
        delivery: order.delivery,
      };
    });

    return { orders: vendorOrders, total: vendorOrders.length };
  }

  private async getMonthlyRevenue(vendorId: string, productIds: string[]) {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const orders = await this.orderModel.find({
      'items.productId': { $in: productIds },
      payment: true,
      createdAt: { $gte: sixMonthsAgo },
    });

    const monthly: Record<string, number> = {};
    for (const order of orders) {
      const month = new Date(order.orderDate).toLocaleString('default', {
        month: 'short',
        year: '2-digit',
      });
      let orderRevenue = 0;
      for (const item of order.items as any[]) {
        if (productIds.includes(item.productId)) {
          orderRevenue += item.price * item.quantity;
        }
      }
      monthly[month] = (monthly[month] || 0) + orderRevenue;
    }

    return Object.entries(monthly).map(([month, revenue]) => ({ month, revenue }));
  }
}
