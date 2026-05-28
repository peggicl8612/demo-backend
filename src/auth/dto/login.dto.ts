/* 開放登入 API 接口 */
import { IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
    @IsString()
    @IsNotEmpty({message: '帳號不能為空'})
    username: string;

    @IsString()
    @IsNotEmpty({message: '密碼不能為空'})
    password: string;
}