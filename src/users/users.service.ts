import { Injectable, BadRequestException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';
import { NotFoundException } from '@nestjs/common';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ErrorCode } from '../common/errors/error-code.map';
import { throwAppError } from '../common/errors/app.exception';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) { }
  
  // 註冊邏輯
  async create(createUserDto: CreateUserDto) {
    const { username, password, email } = createUserDto;
    
    // 1. 檢查帳號是否已經存在
    const existingUser = await this.userModel.findOne({ 
      $or: [{username}, {email}]
    });
    if (existingUser) {
      if (existingUser.username === username) {
        throwAppError(ErrorCode.USER_USERNAME_DUPLICATE, HttpStatus.CONFLICT)
        } else {
          throwAppError(ErrorCode.USER_EMAIL_DUPLICATE, HttpStatus.CONFLICT)
        }
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
  
  // 註冊時，檢查帳號信箱是否已存在
  async checkAvailability(query: { username?: string; email?: string }) {
    const { username, email } = query;
    if (!username && !email) {
      throw new BadRequestException('必須提供 username 或 email');
    }
  
    const filter = username ? { username } : { email };
    const user = await this.findOneByFilter(filter)
  
    return { exists: !!user };
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

  findOneByFilter(filter: { username?: string; email?: string }) {
    return this.userModel.findOne(filter).select('_id').exec();
  }
  update(id: string, updateUserDto: UpdateUserDto) {
    return this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true }).exec();
  }

  remove(id: string) {
    return this.userModel.findByIdAndDelete(id).exec();
  }

  async findMe(userId: string) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('使用者不存在')
    }
    return user; // schema toJSON 會自動去掉 password
  }

  async updateMe(userId: string, dto: UpdateProfileDto) {
    const user = await this.userModel
      .findByIdAndUpdate(userId, dto, { new: true })
      .exec();
    if (!user) {
      throw new NotFoundException('使用者不存在')
    }
    return user;
  }
}
