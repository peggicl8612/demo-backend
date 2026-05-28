import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductDocument = Product & Document;

export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  HIDDEN = 'HIDDEN',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
}

export enum ProductCategory {
  FOOD = 'FOOD',
  LITTER = 'LITTER',
  TOYS = 'TOYS',
  SUPPLIES = 'SUPPLIES',
  OTHER = 'OTHER',
}

@Schema()
export class ProductVariant {
  @Prop({ required: true })
  specName: string;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ required: true, min: 0 })
  stock: number;

  @Prop()
  sku: string;
}

export const ProductVariantSchema = SchemaFactory.createForClass(ProductVariant);

@Schema({ versionKey: false, timestamps: true })
export class Product {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug: string;

  @Prop()
  description: string;

  @Prop({ type: String, enum: ProductCategory, default: ProductCategory.OTHER })
  category: ProductCategory;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ type: [ProductVariantSchema], default: [] })
  variants: ProductVariant[];

  @Prop({ type: String, enum: ProductStatus, default: ProductStatus.ACTIVE })
  status: ProductStatus;

  @Prop({ default: 0 })
  salesCount: number;

  @Prop({ default: 0 })
  viewCount: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
ProductSchema.index({ category: 1, status: 1 });
ProductSchema.index({ salesCount: -1 });
