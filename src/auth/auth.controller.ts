/* 開放登入 API 接口 */
import { Controller, HttpCode, HttpStatus, Body, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly usersService: UsersService,
    ) { }
    
    // POST /auth/login
    @HttpCode(HttpStatus.OK)
    @Post('login')
    login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto)
    }
    // POST /auth/register
    @HttpCode(HttpStatus.CREATED)
    @Post('register')
    async register(@Body() createUserDto: CreateUserDto) {
        await this.usersService.create(createUserDto)
        return this.authService.login(createUserDto)
    }
}
