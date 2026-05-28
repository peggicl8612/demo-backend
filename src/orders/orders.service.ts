import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order, OrderDocument } from './schemas/order.schema';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
  ) {}

  create(createOrderDto: CreateOrderDto) {
    return this.orderModel.create(createOrderDto as unknown as Partial<Order>);
  }

  findAll() {
    return this.orderModel.find().sort({ createdAt: -1 }).exec();
  }

  findOne(id: string) {
    return this.orderModel.findById(id).exec();
  }

  update(id: string, updateOrderDto: UpdateOrderDto) {
    return this.orderModel.findByIdAndUpdate(id, updateOrderDto, { new: true }).exec();
  }

  remove(id: string) {
    return this.orderModel.findByIdAndDelete(id).exec();
  }
}
