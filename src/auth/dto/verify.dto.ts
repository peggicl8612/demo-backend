import { IsString, IsNotEmpty, IsEmail, Length } from 'class-validator'

export class SendCodeDto {
    @IsEmail({}, {message: '電子信箱格式不正確'})
    @IsNotEmpty({ message: '電子信箱不能為空' })
    email: string;
}


export class VerifyAndRegisterDto {
    @IsString()
    @IsNotEmpty({ message: '帳號不能為空' })
    username: string;

    @IsString()
    @IsNotEmpty({ message: '密碼不能為空' })
    password: string;

    @IsEmail({}, { message: '電子信箱格式不正確' })
    email: string;

    @IsString()
    @Length(4, 4, { message: '驗證碼必須為 4 碼' })
    code: string;
    
}

