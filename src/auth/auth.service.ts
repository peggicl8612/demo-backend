// 核心登入邏輯
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import {ErrorCode, ErrorMessageMap} from '../common/errors/error-code.map';
import { CreateUserDto } from '../users/dto/create-user.dto'
import {LoginDto} from './dto/login.dto' 

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService
    ) { }
    
    async login(loginDto: LoginDto) {
        // 1. 在資料庫查詢此使用者（包含加密密碼）
        const user = await this.usersService.findOneForAuth(loginDto.username);
        // 找不到則報錯（401 拒絕存取）
        if (!user) {
            throw new UnauthorizedException({
                errorCode: ErrorCode.USER_NOT_FOUND,
                message: ErrorMessageMap[ErrorCode.USER_NOT_FOUND],
            });
        }

        // 2. 比對密碼（用bcrypt.compare 比對，把明碼跟資料庫的亂碼核對）
        const isMatch = await bcrypt.compare(loginDto.password, user.password);
        if (!isMatch) {
            throw new UnauthorizedException({
                errorCode: ErrorCode.INVALID_CREDENTIALS,
                message: ErrorMessageMap[ErrorCode.INVALID_CREDENTIALS],
            });
        }

        // 3. 準備發放的通行證資料（Payload）
        const payload = {
            // sub 是 JWT 標準欄位，代表 subject（主體，通常放 User ID）
            sub: user.id,
            username: user.username,
            role: user.role
        };

        // 4. 發放通行證（JWT 簽證）
        return {
            message: '登入成功',
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
         }
        
    }

    async register(createUserDto: CreateUserDto) {
        const newUser = await this.usersService.create({
            username: createUserDto.username,
            password: createUserDto.password,
            email: createUserDto.email
        });

        return {
            message: '註冊成功',
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role
            }
        }
    }
}
