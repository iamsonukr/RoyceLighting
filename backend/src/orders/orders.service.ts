import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { Order, OrderDocument, OrderStatus } from './schemas/order.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Cart, CartDocument } from '../cart/schemas/cart.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { EmailService } from '../email/email.service';
import { DeliveryService } from '../delivery/delivery.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private emailService: EmailService,
    private deliveryService: DeliveryService,
    private config: ConfigService,
  ) {}

  // ─── Create Razorpay Order ────────────────────────────────
  async createRazorpayOrder(amount: number) {
    const Razorpay = require('razorpay');
    const razorpay = new Razorpay({
      key_id: this.config.get('RAZORPAY_KEY_ID'),
      key_secret: this.config.get('RAZORPAY_KEY_SECRET'),
    });

    const order = await razorpay.orders.create({
      amount: amount * 100, // paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    });

    return { orderId: order.id, amount: order.amount, currency: order.currency };
  }

  // ─── Verify Payment ──────────────────────────────────────
  verifyPayment(razorpayOrderId: string, razorpayPaymentId: string, signature: string): boolean {
    const secret = this.config.get<string>('RAZORPAY_KEY_SECRET');
    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');
    return expected === signature;
  }

  // ─── Place Order ──────────────────────────────────────────
  async placeOrder(userId: string, dto: CreateOrderDto) {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, ...rest } = dto;

    // Verify Razorpay signature
    const valid = this.verifyPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature);
    if (!valid) throw new BadRequestException('Payment verification failed');

    // Fetch user
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    // Decrease stock for each product
    for (const item of dto.items) {
      await this.productModel.findByIdAndUpdate(item.productId, {
        $inc: { totalQuantity: -item.quantity, salesCount: item.quantity },
      });
    }

    // Create order in DB
    const order = await this.orderModel.create({
      userId: new Types.ObjectId(userId),
      items: dto.items,
      amount: dto.amount,
      deliveryFees: dto.deliveryFees,
      address: dto.address,
      paymentId: razorpayPaymentId,
      razorpayOrderId,
      payment: true,
      status: OrderStatus.PLACED,
      orderDate: new Date(),
    });

    // Clear cart
    await this.cartModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      { items: [] },
    );

    // Emails (non-blocking)
    this.emailService
      .sendOrderPlacedEmail(user.email, order)
      .catch(() => {});
    this.emailService
      .sendAdminNewOrderEmail(order, user.name, user.email)
      .catch(() => {});

    // Update email tracking flag
    await this.orderModel.findByIdAndUpdate(order._id, { emailSentPlaced: true });

    return order;
  }

  // ─── Update Order Status (Admin) ─────────────────────────
  async updateOrderStatus(orderId: string, dto: UpdateOrderStatusDto) {
    const order = await this.orderModel.findById(orderId);
    if (!order) throw new NotFoundException('Order not found');

    const prevStatus = order.status;
    order.status = dto.status;
    await order.save();

    // Fetch customer for emails
    const user = await this.userModel.findById(order.userId);

    // ─── Trigger Delhivery when order is Confirmed ──────────
    if (dto.status === OrderStatus.CONFIRMED && prevStatus !== OrderStatus.CONFIRMED) {
      const productNames = order.items.map((i: any) => i.name).join(', ');
      const totalQty = order.items.reduce((s: number, i: any) => s + i.quantity, 0);
      const totalWeight = totalQty * 200; // assume 200g per item

      const shipmentResult = await this.deliveryService.createShipment({
        orderId: String(order._id).slice(-8).toUpperCase(),
        orderDate: order.orderDate.toISOString(),
        customerName: user?.name || 'Customer',
        customerPhone: order.address.phone,
        customerEmail: user?.email || '',
        addressLine1: order.address.addressLineOne,
        addressLine2: order.address.addressLineTwo,
        city: order.address.city,
        state: order.address.state,
        pinCode: order.address.pinCode,
        country: order.address.country || 'India',
        codAmount: 0,
        orderValue: order.amount,
        paymentMode: 'Prepaid',
        weight: totalWeight,
        productName: productNames,
        quantity: totalQty,
      });

      if (shipmentResult.success) {
        await this.orderModel.findByIdAndUpdate(orderId, {
          delivery: {
            waybill: shipmentResult.waybill,
            trackingUrl: shipmentResult.trackingUrl,
            shipmentId: shipmentResult.shipmentId,
            courierName: 'Delhivery',
            dispatchedAt: new Date(),
          },
        });
      }
    }

    // ─── Email on Shipped ────────────────────────────────────
    if (dto.status === OrderStatus.SHIPPED && !order.emailSentShipped && user) {
      const updated = await this.orderModel.findById(orderId);
      await this.emailService.sendOrderShippedEmail(user.email, updated);
      await this.orderModel.findByIdAndUpdate(orderId, { emailSentShipped: true });
    }

    // ─── Email on Delivered ──────────────────────────────────
    if (dto.status === OrderStatus.DELIVERED && !order.emailSentDelivered && user) {
      await this.emailService.sendOrderDeliveredEmail(user.email, order);
      await this.orderModel.findByIdAndUpdate(orderId, { emailSentDelivered: true });
    }

    return this.orderModel.findById(orderId);
  }

  // ─── Get all orders (Admin) ───────────────────────────────
  async getAllOrders(page = 1, limit = 20, status?: string) {
    const filter: any = {};
    if (status) filter.status = status;

    const [orders, total] = await Promise.all([
      this.orderModel
        .find(filter)
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      this.orderModel.countDocuments(filter),
    ]);

    return { orders, total, page, pages: Math.ceil(total / limit) };
  }

  // ─── Get user orders ─────────────────────────────────────
  async getUserOrders(userId: string) {
    return this.orderModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 });
  }

  // ─── Get single order ────────────────────────────────────
  async getOrder(orderId: string, userId?: string, role?: string) {
    const order = await this.orderModel.findById(orderId).populate('userId', 'name email');
    if (!order) throw new NotFoundException('Order not found');

    if (role !== 'admin' && userId && String(order.userId) !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return order;
  }

  // ─── Track order by waybill ───────────────────────────────
  async trackOrder(orderId: string) {
    const order = await this.orderModel.findById(orderId);
    if (!order) throw new NotFoundException('Order not found');

    if (!order.delivery?.waybill) {
      return { tracked: false, message: 'Shipment not yet created' };
    }

    const tracking = await this.deliveryService.trackShipment(order.delivery.waybill);
    return { tracked: true, delivery: order.delivery, tracking };
  }

  // ─── Admin stats ──────────────────────────────────────────
  async getOrderStats() {
    const [total, placed, confirmed, shipped, delivered, cancelled, revenue] =
      await Promise.all([
        this.orderModel.countDocuments(),
        this.orderModel.countDocuments({ status: OrderStatus.PLACED }),
        this.orderModel.countDocuments({ status: OrderStatus.CONFIRMED }),
        this.orderModel.countDocuments({ status: OrderStatus.SHIPPED }),
        this.orderModel.countDocuments({ status: OrderStatus.DELIVERED }),
        this.orderModel.countDocuments({ status: OrderStatus.CANCELLED }),
        this.orderModel.aggregate([
          { $match: { payment: true } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
      ]);

    return {
      total,
      placed,
      confirmed,
      shipped,
      delivered,
      cancelled,
      revenue: revenue[0]?.total || 0,
    };
  }
}
