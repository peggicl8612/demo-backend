// 
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import {ErrorCode, ErrorMessageMap} from '../../common/errors/error-code.map';

export type JwtPayload = {
    sub: string;
    username: string;
    role: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) { 
    constructor(configService: ConfigService) {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) throw new Error('JWT_SECRET is missing');
        
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: secret
        }); 
    }

    // Passport 會把回傳值掛到 request.user
    validate(payload: JwtPayload) {
        if (!payload?.sub) {
            throw new UnauthorizedException({
                errorCode: ErrorCode.UNAUTHORIZED,
                message: ErrorMessageMap[ErrorCode.UNAUTHORIZED]
            });
        }
        return {
            userId: payload.sub,
            username: payload.username,
            role: payload.role
        };
    }
}