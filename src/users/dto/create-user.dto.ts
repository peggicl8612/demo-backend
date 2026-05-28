import { IsEmail, IsOptional, IsString, IsNotEmpty,MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({message: '帳號不能為空'})
  username: string;

  @IsEmail()
  @IsNotEmpty({message: '電子信箱不能為空'})
  email: string;

  @IsString()
  @IsNotEmpty({message: '密碼不能為空'})
  @MinLength(6, {message: '密碼至少需要6個字元'})
  password: string;

  @IsOptional()
  @IsString()
  realName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  avatar?: string;
}
