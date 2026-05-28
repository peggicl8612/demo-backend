import {
  IsArray,
  IsEmail,
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus, PaymentStatus } from '../schemas/order.schema';

class OrderRecipientDto {
  @IsString()
  name: string;

  @IsString()
  phone: string;

  @IsString()
  address: string;

  @IsEmail()
  email: string;
}

class CreateOrderItemDto {
  @IsMongoId()
  product: string;

  @IsMongoId()
  variantId: string;

  @IsString()
  name: string;

  @IsString()
  specName: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @IsMongoId()
  user: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @IsNumber()
  @Min(0)
  totalAmount: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  shippingFee?: number;

  @ValidateNested()
  @Type(() => OrderRecipientDto)
  recipient: OrderRecipientDto;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsString()
  merchantTradeNo: string;

  @IsOptional()
  @IsEnum(OrderStatus)
  orderStatus?: OrderStatus;

  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @IsOptional()
  @IsString()
  note?: string;
}
