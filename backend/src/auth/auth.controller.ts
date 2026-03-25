import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  UnauthorizedException,
  InternalServerErrorException,
  UseGuards,
} from '@nestjs/common';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { CreateInternalUserDto } from './dto/create-internal-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { Roles } from './decorators/roles.decorator';
import { RolesGuard } from './guard/roles.guard';

type RequestWithCookies = Request & { cookies?: Record<string, unknown> };
type RequestWithUser = Request & { user?: { id: number; role: string } };

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('signup')
  async signup(@Body() dto: SignupDto) {
    const user = await this.authService.signup(dto);
    return {
      message: 'Signup successful',
      user,
    };
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const data = await this.authService.login(dto);

      res.cookie('refreshToken', data.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      return {
        accessToken: data.accessToken,
        user: data.user,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  @Public()
  @Post('refresh')
  async refresh(@Req() req: RequestWithCookies) {
    try {
      const cookies = (req as unknown as { cookies?: Record<string, unknown> })
        .cookies;
      const cookieValue = cookies?.refreshToken;
      const refreshToken =
        typeof cookieValue === 'string' ? cookieValue : undefined;
      if (!refreshToken) throw new UnauthorizedException('Invalid credentials');

      const accessToken = await this.authService.refresh(refreshToken);

      return { accessToken };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  @Public()
  @Post('logout')
  async logout(
    @Req() req: RequestWithCookies,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const cookies = (req as unknown as { cookies?: Record<string, unknown> })
        .cookies;
      const cookieValue = cookies?.refreshToken;
      const refreshToken =
        typeof cookieValue === 'string' ? cookieValue : undefined;
      if (!refreshToken) return { message: 'Already logged out' };

      await this.authService.logout(refreshToken);

      // Clear cookie on both possible paths.
      // Older sessions may have the default path '/auth' (set on /auth/login).
      const cookieOpts = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const,
      };
      res.clearCookie('refreshToken', { ...cookieOpts, path: '/' });
      res.clearCookie('refreshToken', { ...cookieOpts, path: '/auth' });

      return { message: 'Logged out successfully' };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Post('internal-user')
  async createInternalUser(
<<<<<<< HEAD
    @Req() req: RequestWithUser,
=======
    @Req() req: Request,
>>>>>>> 34d8f0563272fc3ffddc6ac63922119f2dfd0da5
    @Body() dto: CreateInternalUserDto,
  ) {
    // JwtAuthGuard populates req.user
    const requestingUser = req.user;
    if (!requestingUser) throw new UnauthorizedException('Unauthorized');
    return this.authService.createInternalUser(requestingUser, dto);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('change-password')
  async changePassword(
    @Req() req: RequestWithUser,
    @Body() dto: ChangePasswordDto,
  ) {
    const userId = req.user?.id;
    return this.authService.changePassword(userId, dto);
  }
}
