import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) { }
  
  // 註冊邏輯
  async create(createUserDto: CreateUserDto) {
    const { username, password, email } = createUserDto;
    
    // 1. 檢查帳號是否已經存在
    const existingUser = await this.userModel.findOne({ username });
    if (existingUser) {
      throw new ConflictException('帳號已存在')
    }

    // 2. 密碼加密（Salt Rounds 雜湊次數）
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 3. 儲存進資料庫（替換成加密後的密碼）
    const newUser = new this.userModel({
      username,
      password: hashedPassword,
      email,
    });
    return newUser.save();
  }

  

  findAll() {
    return this.userModel.find().sort({ createdAt: -1 }).exec();
  }

  findOne(id: string) {
    return this.userModel.findById(id).exec();
  }

  // 登入時，查詢帳號密碼是否正確
  async findOneForAuth(username: string) {
    return this.userModel.findOne({ username }).select('+password').exec();
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true }).exec();
  }

  remove(id: string) {
    return this.userModel.findByIdAndDelete(id).exec();
  }
}
