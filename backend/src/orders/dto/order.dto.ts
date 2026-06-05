import { IsIn, IsNumber, IsOptional, IsString, IsArray, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '../schemas/order.schema';

export class OrderItemDto {
  @IsOptional() @IsString() productId?: string;
  @IsOptional() @IsString() product?: string;
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsNumber() price?: number;
  @IsNumber() @Min(1) quantity: number;
  @IsOptional() @IsString() color?: string;
  @IsOptional() @IsString() size?: string;
  @IsOptional() @IsString() image?: string;
  @IsOptional() @IsNumber() itemTotal?: number;
}

export class OrderAddressDto {
  @IsOptional() @IsString() fullName?: string;
  @IsString() addressLineOne: string;
  @IsOptional() @IsString() addressLineTwo?: string;
  @IsString() city: string;
  @IsString() state: string;
  @IsString() pinCode: string;
  @IsString() country: string;
  @IsString() phone: string;
  @IsOptional() @IsString() landmark?: string;
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsOptional() @IsNumber() amount?: number;
  @IsOptional() @IsNumber() deliveryFees?: number;

  @IsOptional() @IsNumber() totalAmount?: number;

  @IsOptional() @IsIn(['cod', 'online', 'razorpay'])
  paymentMethod?: 'cod' | 'online' | 'razorpay';

  @ValidateNested()
  @Type(() => OrderAddressDto)
  address: OrderAddressDto;

  @IsOptional() @IsString() razorpayOrderId?: string;
  @IsOptional() @IsString() razorpayPaymentId?: string;
  @IsOptional() @IsString() razorpaySignature?: string;

  @IsOptional() @IsString() deliveryMethod?: string;
}

export class UpdateOrderStatusDto {
  status: OrderStatus;
}
