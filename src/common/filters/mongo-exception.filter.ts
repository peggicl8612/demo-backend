// src/common/filters/mongo-exception.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { mongo } from 'mongoose';
import { ErrorCode, ErrorMessageMap } from '../errors/error-code.map';

@Catch()
export class MongoExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = ErrorCode.DATABASE_ERROR;

    // 處理 MongoDB 重複鍵值錯誤 (例如註冊時信箱重複)
    if (exception instanceof mongo.MongoServerError && exception.code === 11000) {
      status = HttpStatus.CONFLICT; // 409
      
      // 假設 exception.message 會包含重複的欄位名稱
      const errorMessage = exception.message.toLowerCase();
      if (errorMessage.includes('email')) {
        code = ErrorCode.USER_EMAIL_DUPLICATE;
      } else if (errorMessage.includes('username')) {
        code = ErrorCode.USER_USERNAME_DUPLICATE;
      }
    }

    // 統一回傳格式給前端
    response.status(status).json({
      statusCode: status,
      errorCode: code,
      message: ErrorMessageMap[code], // 從字典檔拿乾淨的訊息
      timestamp: new Date().toISOString(),
    });
  }
}