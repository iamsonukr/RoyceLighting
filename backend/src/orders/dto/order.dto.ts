import { IsString, IsNumber, IsArray, IsBoolean, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '../schemas/order.schema';

export class OrderItemDto {
  @IsString() productId: string;
  @IsString() name: string;
  @IsNumber() price: number;
  @IsNumber() quantity: number;
  @IsOptional() @IsString() color?: string;
  @IsOptional() @IsString() size?: string;
  @IsOptional() @IsString() image?: string;
  @IsOptional() @IsNumber() itemTotal?: number;
}

export class OrderAddressDto {
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

  @IsNumber() amount: number;
  @IsNumber() deliveryFees: number;

  @ValidateNested()
  @Type(() => OrderAddressDto)
  address: OrderAddressDto;

  @IsString() razorpayOrderId: string;
  @IsString() razorpayPaymentId: string;
  @IsString() razorpaySignature: string;

  @IsOptional() @IsString() deliveryMethod?: string;
}

export class UpdateOrderStatusDto {
  status: OrderStatus;
}
