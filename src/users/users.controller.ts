import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from '../common/decorator/roles.decorator';
import { Role } from '../common/enums/role.enums';
import { Public } from '../common/decorator/public.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { UsersService } from './users.service';

/** 與 JwtStrategy.validate 回傳一致 */
type AuthUser = {
  userId: string;
  username: string;
  role: string;
};

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Get('check-availability')
  checkAvailability(
    @Query('username') username?: string,
    @Query('email') email?: string,
  ) {
    return this.usersService.checkAvailability({ username, email });
  }

  // ========== 會員：本人資料（不需 @Roles）==========
  @Get('me')
  getMe(@Req() req: Request & { user: AuthUser }) {
    return this.usersService.findMe(req.user.userId);
  }

  @Patch('me')
  updateMe(
    @Req() req: Request & { user: AuthUser },
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateMe(req.user.userId, dto);
  }

  // ========== 後台：僅 ADMIN ==========
  @Roles(Role.ADMIN)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Roles(Role.ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Roles(Role.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}