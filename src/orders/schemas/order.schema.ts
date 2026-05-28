import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentStatus {
  UNPAID = 'UNPAID',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

@Schema({ _id: false })
export class RecipientInfo {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  email: string;
}

const RecipientInfoSchema = SchemaFactory.createForClass(RecipientInfo);

@Schema({ _id: false })
export class OrderItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  product: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  variantId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  specName: string;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ required: true, min: 1 })
  quantity: number;
}

const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

@Schema({ versionKey: false, timestamps: true })
export class Order {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ type: [OrderItemSchema], default: [] })
  items: OrderItem[];

  @Prop({ required: true, min: 0 })
  totalAmount: number;

  @Prop({ required: true, min: 0, default: 0 })
  shippingFee: number;

  @Prop({ type: RecipientInfoSchema, required: true })
  recipient: RecipientInfo;

  @Prop()
  paymentMethod: string;

  @Prop({ required: true })
  merchantTradeNo: string;

  @Prop()
  tradeNo: string;

  @Prop()
  paymentDate: Date;

  @Prop({ type: String, enum: OrderStatus, default: OrderStatus.PENDING })
  orderStatus: OrderStatus;

  @Prop({ type: String, enum: PaymentStatus, default: PaymentStatus.UNPAID })
  paymentStatus: PaymentStatus;

  @Prop()
  note: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ merchantTradeNo: 1 }, { unique: true });
