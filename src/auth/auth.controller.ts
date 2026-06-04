/* 開放登入 API 接口 */
import { Controller, HttpCode, HttpStatus, Body, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';
// import { CreateUserDto } from '../users/dto/create-user.dto';
import { SendCodeDto, VerifyAndRegisterDto } from './dto/verify.dto'
import { Public } from '../common/decorator/public.decorator';
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly usersService: UsersService,
    ) { }
    
    // POST /auth/login
    @HttpCode(HttpStatus.OK)
    @Post('login')
        @Public()
    login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto)
    }
    // 1. 發送驗證碼: POST /auth/send-code
    @HttpCode(HttpStatus.OK)
    @Post('send-code')
        @Public()
    async sendCode(@Body() sendCodeDto: SendCodeDto) {
        return this.authService.sendVerificationCode(sendCodeDto.email);
    }

    // 2. 驗證並註冊登入：POST /auth/verify
    @HttpCode(HttpStatus.CREATED)
    @Post('verify')
        @Public()
    async verifyAndRefister(@Body() verifyDto: VerifyAndRegisterDto) {
        // a. 驗證使用者提交的 code 是否與 Redis 中的一致
        await this.authService.verifyEmailCode(verifyDto.email, verifyDto.code);

        // b. 驗證成功，將使用者寫入 MongoDB
        const newUser = await this.usersService.create({
            username: verifyDto.username,
            password: verifyDto.password,
            email: verifyDto.email
        });

        // c. 註冊完畢，直接產生 JWT Token 讓前端自動登入
        return this.authService.login({
            username: newUser.username,
            password: verifyDto.password
        })
    }

    
}
