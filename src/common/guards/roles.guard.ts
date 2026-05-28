import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core'
import { ROLES_KEY } from '../decorator/roles.decorator'
import { Role } from '../enums/role.enums'
import { ErrorCode, ErrorMessageMap } from '../errors/error-code.map'

@Injectable()
export class RolesGuard implements CanActivate { 
    constructor(private reflector: Reflector) {}
    
    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        // 若 API 沒有貼標籤，代表完全公開或不需要權限，可直接放行
        if (!requiredRoles) {
            return true;
        }

        // 從 Request 中取得使用者資訊
        const { user } = context.switchToHttp().getRequest();
        
        // 若沒有 user，代表未經過 JWT 驗證，拒絕存取，這邊再做防呆
        if (!user) {
            return false;
        }

        const hasRole = requiredRoles.includes(user.role);
        // 若權限不符，拋出 403 Forbidden
        if (!hasRole) {
            throw new ForbiddenException({
                errorCode: ErrorCode.PERMISSION_DENIED,
                message: ErrorMessageMap[ErrorCode.PERMISSION_DENIED]
            });
        }
        // 放行
        return true;
    }
}
