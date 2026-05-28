import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  DELETED = 'DELETED',
}

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

@Schema({ _id: false })
export class CartItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  product: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  variantId: Types.ObjectId;

  @Prop({ required: true, min: 1 })
  quantity: number;
}

export const CartItemSchema = SchemaFactory.createForClass(CartItem);

@Schema({
  versionKey: false,
  timestamps: true,
  toJSON: {
    transform: (doc, ret: any) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.password;
      return ret;
    }
  }
})
  
export class User {
  @Prop({ required: true, trim: true, unique: true })
  username: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ required: true, lowercase: true, trim: true })
  email: string;

  @Prop()
  realName: string;

  @Prop()
  phone: string;

  @Prop()
  address: string;

  @Prop()
  avatar: string;

  @Prop({ type: [CartItemSchema], default: [] })
  cart: CartItem[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Cat' }], default: [] })
  favoriteCats: Types.ObjectId[];

  @Prop({ type: String, enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Prop({ type: String, enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ email: 1 }, { unique: true });
