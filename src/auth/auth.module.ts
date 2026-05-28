import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
// 到資料庫查帳號
import {UsersModule} from '../users/users.module'
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    UsersModule,
    // 註冊 JWT 發證機
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) {
          throw new Error('JWT_SECRET is missing');
        }
        return {
          secret,
          signOptions: {
            expiresIn: '1d',
          },
        };
      },
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController]
})
export class AuthModule {}
