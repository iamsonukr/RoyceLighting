import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

export enum OrderStatus {
  PLACED = 'Placed',
  CONFIRMED = 'Confirmed',
  PROCESSING = 'Processing',
  SHIPPED = 'Shipped',
  OUT_FOR_DELIVERY = 'Out for Delivery',
  DELIVERED = 'Delivered',
  CANCELLED = 'Cancelled',
  RETURNED = 'Returned',
}

@Schema({ _id: false })
class OrderItem {
  @Prop({ required: true }) productId: string;
  @Prop({ required: true }) name: string;
  @Prop({ required: true }) price: number;
  @Prop({ required: true }) quantity: number;
  @Prop() color?: string;
  @Prop() size?: string;
  @Prop() image?: string;
  @Prop() itemTotal?: number;
}

@Schema({ _id: false })
class OrderAddress {
  @Prop({ required: true }) addressLineOne: string;
  @Prop() addressLineTwo?: string;
  @Prop({ required: true }) city: string;
  @Prop({ required: true }) state: string;
  @Prop({ required: true }) pinCode: string;
  @Prop({ required: true }) country: string;
  @Prop({ required: true }) phone: string;
  @Prop() landmark?: string;
}

@Schema({ _id: false })
class DeliveryInfo {
  @Prop() waybill?: string;           // Delhivery AWB number
  @Prop() trackingUrl?: string;
  @Prop() shipmentId?: string;
  @Prop() courierName?: string;
  @Prop() estimatedDelivery?: string;
  @Prop() dispatchedAt?: Date;
}

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: [Object], required: true })
  items: OrderItem[];

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  deliveryFees: number;

  @Prop({ type: Object, required: true })
  address: OrderAddress;

  @Prop({ type: String, enum: OrderStatus, default: OrderStatus.PLACED })
  status: OrderStatus;

  @Prop({ default: false })
  payment: boolean;

  @Prop({ trim: true })
  paymentId?: string;

  @Prop({ trim: true })
  razorpayOrderId?: string;

  @Prop({ default: 'razorpay' })
  paymentMethod: string;

  @Prop({ type: Object })
  delivery?: DeliveryInfo;

  @Prop({ type: Date, default: Date.now })
  orderDate: Date;

  @Prop({ trim: true })
  deliveryMethod?: string;

  // Email notification tracking
  @Prop({ default: false }) emailSentPlaced: boolean;
  @Prop({ default: false }) emailSentShipped: boolean;
  @Prop({ default: false }) emailSentDelivered: boolean;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
