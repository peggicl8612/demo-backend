import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode, ErrorMessageMap } from './error-code.map';

export function throwAppError(
    errorCode: ErrorCode,
    status: HttpStatus,
    message?: string,
): never {
    throw new HttpException({
        errorCode,
        message: message ?? ErrorMessageMap[errorCode]
    },
    status,
    )
}