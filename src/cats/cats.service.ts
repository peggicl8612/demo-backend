import { Injectable } from '@nestjs/common';
import { CreateCatDto } from './dto/create-cat.dto';
import { UpdateCatDto } from './dto/update-cat.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Cat, CatDocument } from './schemas/cat.schemas';
import { Model } from 'mongoose';

@Injectable()
export class CatsService {
  constructor(@InjectModel(Cat.name) private readonly catModel: Model<CatDocument>) {}

  create(createCatDto: CreateCatDto) {
    return this.catModel.create(createCatDto);
  }

  findAll() {
    return this.catModel.find().sort({ createdAt: -1 }).exec();
  }

  findOne(id: string) {
    return this.catModel.findById(id).exec();
  }

  update(id: string, updateCatDto: UpdateCatDto) {
    return this.catModel.findByIdAndUpdate(id, updateCatDto, { new: true }).exec();
  }

  remove(id: string) {
    return this.catModel.findByIdAndDelete(id).exec();
  }
}
