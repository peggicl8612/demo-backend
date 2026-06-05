import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpStatus,
    HttpException
} from '@nestjs/common';
import { Response } from 'express';
import { mongo } from 'mongoose';
import { ErrorCode, ErrorMessageMap } from '../errors/error-code.map';

type AppErrorBody = {
    errorCode?: string;
    message?: string | string[];
}

@Catch() // 不指定型別，捕捉所有錯誤
export class AllExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        if (exception instanceof mongo.MongoServerError && exception.code === 11000) {
            const msg = exception.message.toLowerCase();
            const code = msg.includes('username')
                ? ErrorCode.USER_USERNAME_DUPLICATE
                : ErrorCode.USER_EMAIL_DUPLICATE;
            return response.status(HttpStatus.CONFLICT).json({
                errorCode: code,
                message: ErrorMessageMap[code],
            });
        }

        const status = exception instanceof HttpException
            ? exception.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR;
        const raw = exception instanceof HttpException
            ? exception.getResponse()
            : null;

        const body: AppErrorBody =
            typeof raw === 'string' 
                ? { message: raw }
                : raw && typeof raw === 'object'
                    ? (raw as AppErrorBody)
                    : {message: ErrorMessageMap[ErrorCode.UNKNOWN_ERROR]}
        
        if (body.errorCode && body.message) {
            const payload = body as AppErrorBody & Record<string, unknown>;
            const { errorCode, message, ...extra } = payload;
            return response.status(status).json({
                errorCode,
                message:
                    typeof message === 'string'
                        ? message
                        : (message as string[]).join(', '),
                ...extra,
            });
        }
    
        const { errorCode, message } = mapStatusToError(status, body.message);

        return response.status(status).json({ errorCode, message });
    }
}

function mapStatusToError(
    status: number,
    message?: string | string[],
): { errorCode: string; message: string } {
    const fallbackMsg =
        typeof message === 'string'
            ? message
            : Array.isArray(message)
                ? message.join(', ')
                : ErrorMessageMap[ErrorCode.UNKNOWN_ERROR];
    
    switch (status) {
        case HttpStatus.UNAUTHORIZED:
            return {
                errorCode: ErrorCode.UNAUTHORIZED,
                message: ErrorMessageMap[ErrorCode.UNAUTHORIZED]
            };
        case HttpStatus.FORBIDDEN:
            return {
                errorCode: ErrorCode.PERMISSION_DENIED,
                message: ErrorMessageMap[ErrorCode.PERMISSION_DENIED]
            };
        case HttpStatus.BAD_REQUEST:
            return {
                errorCode: ErrorCode.VALIDATION_FAILED,
                message: fallbackMsg || ErrorMessageMap[ErrorCode.VALIDATION_FAILED]
            };
        case HttpStatus.NOT_FOUND:
            return {
                errorCode: ErrorCode.RESOURCE_NOT_FOUND,
                message: fallbackMsg || ErrorMessageMap[ErrorCode.RESOURCE_NOT_FOUND]
            };
        case HttpStatus.TOO_MANY_REQUESTS:
            return {
                errorCode: ErrorCode.TOO_MANY_REQUESTS,
                message: fallbackMsg
            };
        case HttpStatus.CONFLICT:
            return mapConflictError(message);
        default:
            return {
                errorCode: ErrorCode.UNKNOWN_ERROR,
                message: fallbackMsg
            }
    }
}

function mapConflictError(message?: string | string[]): {
    errorCode: string;
    message: string;
} {
    const text =
        typeof message === 'string'
            ? message
            : Array.isArray(message)
              ? message.join(' ')
              : '';

    if (text.includes('帳號') || text.includes('username')) {
        return {
            errorCode: ErrorCode.USER_USERNAME_DUPLICATE,
            message: ErrorMessageMap[ErrorCode.USER_USERNAME_DUPLICATE],
        };
    }
    if (text.includes('信箱') || text.includes('email')) {
        return {
            errorCode: ErrorCode.USER_EMAIL_DUPLICATE,
            message: ErrorMessageMap[ErrorCode.USER_EMAIL_DUPLICATE],
        };
    }
    return {
        errorCode: ErrorCode.USER_EMAIL_DUPLICATE,
        message: text || ErrorMessageMap[ErrorCode.USER_EMAIL_DUPLICATE],
    };
}