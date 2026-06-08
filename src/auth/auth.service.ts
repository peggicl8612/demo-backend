// 核心登入邏輯
import { Injectable, UnauthorizedException, BadRequestException, InternalServerErrorException, HttpStatus,HttpException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import * as bcrypt from 'bcrypt';
import { randomInt } from 'crypto';
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
        private jwtService: JwtService,
        private configService: ConfigService
    ) { 
        console.log('當前讀到的信箱帳號:', process.env.EMAIL_USER);
        // 初始化 Redis 連線（雲端優先使用 REDIS_URL，例如 rediss://）
        const redisUrl = this.configService.get<string>('REDIS_URL');
        const redisUseTls = this.configService.get<string>('REDIS_USE_TLS', 'false') === 'true';
        const baseRedisOptions = {
            maxRetriesPerRequest: 3,
            enableReadyCheck: true,
        };

        if (redisUrl) {
            this.redisClient = new Redis(redisUrl, baseRedisOptions);
        } else {
            this.redisClient = new Redis({
                host: this.configService.get('REDIS_HOST', 'localhost'),
                port: parseInt(this.configService.get('REDIS_PORT', '6379'), 10),
                password: this.configService.get('REDIS_PASSWORD') || undefined,
                ...(redisUseTls ? { tls: {} } : {}),
                maxRetriesPerRequest: 3,
                connectTimeout: 10000,
            });
        }

        this.redisClient.on('error', (error) => {
            console.error('Redis 連線錯誤:', error);
        });
        // 初始化 Nodemailer 寄信設定（使用 .env 的 SMTP 設定，支援 Mailtrap 等）
        this.transporter = nodemailer.createTransport({
            host: this.configService.get('EMAIL_HOST'),
            port: parseInt(this.configService.get('EMAIL_PORT', '587'), 10),
            auth: {
                user: this.configService.get('EMAIL_USER'),
                pass: this.configService.get('EMAIL_PASS'),
            },
        });
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
        const cooldownKey = `auth:code:cooldown:${email}`;
        const codeKey = `auth:code:${email}`;

        // 1. 防濫用檢查：是否還在 60 秒冷卻期間
        const isCooldown = await this.redisClient.get(cooldownKey);
        if (isCooldown) {
            const ttl = await this.redisClient.ttl(cooldownKey);
            const retryAfter = ttl > 0 ? ttl : this.configService.get<number>('REDIS_TTL', 60);
            throw new HttpException(
                {
                    errorCode: ErrorCode.TOO_MANY_REQUESTS,
                    message: ErrorMessageMap[ErrorCode.TOO_MANY_REQUESTS],
                    retryAfter,
                },
                HttpStatus.TOO_MANY_REQUESTS,
            );
        }
        // 2. 產生 4 位數的驗證碼
  
        const code = randomInt(1000, 10000).toString();
        
        // 3. 讀取環境變數 TTL (確保 Redis TTL 存在，否則預測 60)
        const cooldownTtl = this.configService.get<number>('REDIS_TTL', 60);
        const codeTtl = this.configService.get<number>('REDIS_CODE_TTL', 300)
       
        // 4. 同步寫入 Redis，使用 Pipeline 或連續 await，避免併發問題
        await this.redisClient.setex(cooldownKey, cooldownTtl, '1')
        await this.redisClient.setex(codeKey, codeTtl, code)
        try {
            // 發送 email
            await this.transporter.sendMail({
                from: `"Neko Space" <${this.configService.get('EMAIL_FROM', 'noreply@nekospace.com')}>`,
                to: email,
                subject: '[Neko Space] 您的註冊驗證碼',
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px;">
                        <h2 style="color: #575757;">歡迎註冊貓咪專案</h2>
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

        return {
            statusCode: 200,
            message: '驗證碼已發送',
            retryAfter: cooldownTtl
        }
    }

    // 驗證 email 驗證信
    async verifyEmailCode(email: string, code: string) {
        const savedCode = await this.redisClient.get(`auth:code:${email}`)

        // 判斷是否存在
        if (!savedCode || savedCode !== code) {
            throw new BadRequestException('驗證碼已過期或不存在，請重新發送')
        }
 

        // 驗證成功，立即從 Redis 刪除該驗證碼，確保「一次性使用 OTP」的安全原則
        await this.redisClient.del(`auth:code:${email}`);

        return true;
    }

    
}
