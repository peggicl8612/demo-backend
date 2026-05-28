// 核心登入邏輯
import { Injectable, UnauthorizedException, BadRequestException, InternalServerErrorException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import {ErrorCode, ErrorMessageMap} from '../common/errors/error-code.map';
// import { CreateUserDto } from '../users/dto/create-user.dto'
import { LoginDto } from './dto/login.dto' 

// 引入新套件
import Redis from 'ioredis';
import * as nodemailer from 'nodemailer'

@Injectable()
export class AuthService {
    private redisClient: Redis;
    private transporter: nodemailer.Transporter;

    constructor(
        private usersService: UsersService,
        private jwtService: JwtService
    ) { 
        console.log('當前讀到的信箱帳號:', process.env.EMAIL_USER);
        // 初始化 Redis 連線(對應 docker-compose 的 port 6379)
        this.redisClient = new Redis({
            host: 'localhost',
            port: 6379
        })
        // 初始化 Nodemailer 寄信設定
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
            
        })
    }
    
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

    // 產收並發送驗證碼
    async sendVerificationCode(email: string) {
        // 產生 4 位數的驗證碼
        const code = Math.floor(1000 + Math.random() * 9999).toString();

        try {
            // 存入 Redis，設定 key 為 auth:code:{email}, 並設定過期間為 300 秒
            await this.redisClient.setex(`auth:code:${email}`, 300, code);

            // 發送 email
            await this.transporter.sendMail({
                from: `"Neko Space" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: '[Neko Space] 您的註冊驗證碼',
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px;">
                        <h2>歡迎註冊貓咪專案</h2>
                        <p>您的驗證碼為：</p>
                        <h1 style="color: #409EFF; letter-spacing: 5px;">${code}</h1>
                        <p>此驗證碼將在 <strong>5 分鐘</strong> 後失效。若非本人操作，請忽略此信件。</p>
                    </div>
                `,
            })
        } catch (error) {
            console.log('發送驗證碼失敗', error)
            throw new InternalServerErrorException('無法發送驗證信，請稍後再試')
        }
    }

    // 驗證 email 驗證信
    async verifyEmailCode(email: string, code: string) {
        const savedCode = await this.redisClient.get(`auth:code:${email}`)

        // 判斷是否存在
        if (!savedCode || savedCode !== code) {
            throw new BadRequestException('驗證碼已過期或不存在，請重新發送')
        }

        // 判斷是否正確
        if (savedCode !== code) {
            throw new BadRequestException('驗證碼錯誤')
        }

        // 驗證成功，立即從 Redis 刪除該驗證碼，確保「一次性使用 OTP」的安全原則
        await this.redisClient.del(`auth:code:${email}`);

        return true;
    }

    /* async register(createUserDto: CreateUserDto) {
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
    } */
}
