import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import  dayjs from 'dayjs';

export type CatDocument = Cat & Document;

export enum CatStatus {
  REVIEWING = 'REVIEWING', // 審核中
  AVAILABLE = 'AVAILABLE',
  // BOOKED = 'BOOKED', // 預約中(暫不開發)
  ADOPTED = 'ADOPTED',
  REJECTED = 'REJECTED',
}

export enum CatSource {
  GOVERNMENT = 'GOVERNMENT', // 政府機構，預設狀態 AVAILABLE
  USER = 'USER', // 用戶上傳，預設狀態 REVIEWING
  ADMIN = 'ADMIN' // 管理員上傳，預設狀態 AVAILABLE
}

@Schema({
  versionKey: false,
  timestamps: true,
  toJSON: {
    transform: (doc, ret: any) => {
      if (ret._id) {
        ret.id = ret._id.toString();
        delete ret._id;
      }
      delete ret.__v;
      if (ret.createdAt) {
        ret.createdAt = dayjs(ret.createdAt).format('YYYY-MM-DD HH:mm:ss');
      }
      if (ret.updatedAt) {
        ret.updatedAt = dayjs(ret.updatedAt).format('YYYY-MM-DD HH:mm:ss');
      }
      return ret;
    }
  }
})
export class Cat {
  @Prop({ required: true })
  name: string;

  @Prop({ default: '米克斯' })
  breed: string;

  @Prop()
  ageCategory: string; // 幼貓, 成貓, 老貓

  @Prop()
  gender: string; // 公, 母, 未知

  @Prop([String]) // 圖片網址陣列
  images: string[];

  @Prop()
  description: string;

  @Prop({ default: false })
  isSpayed: boolean;

  @Prop()
  vaccinationStatus: string;

  @Prop()
  location: string;

  @Prop({
    type: String,
    enum: CatStatus,
    default: CatStatus.REVIEWING,
  })
  status: CatStatus;

  @Prop({
    type: String,
    enum: CatSource,
    default: CatSource.USER,
  })
  source: CatSource;

  @Prop()
  externalGovId: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  uploaderId: Types.ObjectId;

  @Prop({ default: 0 })
  viewCount: number;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  favoritedBy: Types.ObjectId[];
}

export const CatSchema = SchemaFactory.createForClass(Cat);
CatSchema.index({ status: 1, location: 1 });