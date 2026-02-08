import { Body, Controller, Get, Patch, Req, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { UserService } from './user.service';
import { UpdateMeDto } from './dto/update-me.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  async me(@Req() req: Request) {
    const user = (req as any).user as { id: number } | undefined;
    if (!user?.id) throw new UnauthorizedException('Unauthorized');
    return this.userService.getMe(user.id);
  }

  @Patch('me')
  async updateMe(@Req() req: Request, @Body() dto: UpdateMeDto) {
    const user = (req as any).user as { id: number } | undefined;
    if (!user?.id) throw new UnauthorizedException('Unauthorized');
    return this.userService.updateMe(user.id, dto);
  }
}
