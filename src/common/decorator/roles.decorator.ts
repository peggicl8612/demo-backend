import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums/role.enums';

// 定義常數 key 提供給 Guard 使用
export const ROLES_KEY = 'roles';

export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

