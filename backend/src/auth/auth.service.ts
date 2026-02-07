import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { CreateInternalUserDto } from './dto/create-internal-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { randomBytes, createHash } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  // signup service logic
  async signup(dto: SignupDto) {
    try {
      const existingUser = await this.prisma.user.findUnique({
        where: {
          email: dto.email,
        },
      });

      if (existingUser) {
        throw new BadRequestException('Email already exists');
      }

      const hashedPassword = await bcrypt.hash(dto.password, 10);

      const user = await this.prisma.user.create({
        data: {
          name: dto.name,
          email: dto.email,
          password: hashedPassword,
          role: 'PORTAL',
        },
      });

      const { password, ...result } = user;
      return result;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new Error('Something went wrong');
    }
  }

  // login service logic
  async login(dto: LoginDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (!user) {
        throw new UnauthorizedException('Account not exist');
      }

      const isPasswordValid = await bcrypt.compare(dto.password, user.password);

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid password');
      }

      const accessToken = this.generateAccessToken(user);
      const refreshToken = await this.createRefreshToken(user.id);

      const { password, ...result } = user;

      return {
        accessToken,
        refreshToken,
        user: result,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new Error('Something went wrong');
    }
  }

  // func to generate access token (jwt)
  private generateAccessToken(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return this.jwtService.sign(payload, { expiresIn: '20m' });
  }

  async createInternalUser(requestingUser: { id: number; role: string }, dto: CreateInternalUserDto) {
    if (requestingUser.role !== 'ADMIN') {
      throw new ForbiddenException('Only admin can create internal user');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        role: 'INTERNAL',
      },
    });

    const { password, ...result } = user;
    return result;
  }

  // func to create refresh token
  private async createRefreshToken(userId: number) {
    const plainToken = randomBytes(64).toString('hex');
    const tokenHash = createHash('sha256').update(plainToken).digest('hex');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await this.prisma.refreshToken.create({
      data: {
        token: tokenHash,
        userId,
        expiresAt,
      },
    });

    return plainToken;
  }

  // refresh token service logic
  async refresh(refreshToken: string) {
    try {
      const tokenHash = createHash('sha256').update(refreshToken).digest('hex');
      
      const tokenRecord = await this.prisma.refreshToken.findFirst({
        where: {
          token: tokenHash,
          expiresAt: { gt: new Date() },
        },
      });

      if (!tokenRecord) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const user = await this.prisma.user.findUnique({
        where: { id: tokenRecord.userId },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const newAccessToken = this.generateAccessToken(user);

      return newAccessToken;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new Error('Something went wrong');
    }
  }

  // logout service logic
  async logout(refreshToken: string) {
    try {
      const tokenHash = createHash('sha256').update(refreshToken).digest('hex');
      
      const tokenRecord = await this.prisma.refreshToken.findFirst({
        where: {
          token: tokenHash,
          expiresAt: { gt: new Date() },
        },
      });

      if (!tokenRecord) {
        throw new UnauthorizedException('Invalid credentials');
      }

      await this.prisma.refreshToken.delete({ where: { id: tokenRecord.id } });
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new Error('Something went wrong');
    }
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new BadRequestException('Account not exist');
    }

    const plainToken = randomBytes(48).toString('hex');
    const tokenHash = createHash('sha256').update(plainToken).digest('hex');

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await this.prisma.passwordResetToken.create({
      data: {
        token: tokenHash,
        userId: user.id,
        expiresAt,
      },
    });

    // In production you would email the reset link containing `plainToken`.
    return {
      message: 'The password reset link has been sent to your email.',
      ...(process.env.NODE_ENV !== 'production' ? { token: plainToken } : {}),
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const tokenHash = createHash('sha256').update(dto.token).digest('hex');

    const tokenRecord = await this.prisma.passwordResetToken.findFirst({
      where: {
        token: tokenHash,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!tokenRecord) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: tokenRecord.userId },
        data: { password: hashedPassword },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: tokenRecord.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return { message: 'Password reset successful' };
  }

  async changePassword(userId: number | undefined, dto: ChangePasswordDto) {
    if (!userId) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isCurrentValid = await bcrypt.compare(
      dto.currentPassword,
      user.password,
    );

    if (!isCurrentValid) {
      throw new UnauthorizedException('Invalid password');
    }

    const isSamePassword = await bcrypt.compare(dto.newPassword, user.password);
    if (isSamePassword) {
      throw new BadRequestException('New password must be different');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      }),
      // Invalidate all active refresh tokens after password change.
      this.prisma.refreshToken.deleteMany({ where: { userId } }),
      // Invalidate any outstanding reset tokens.
      this.prisma.passwordResetToken.updateMany({
        where: { userId, usedAt: null },
        data: { usedAt: new Date() },
      }),
    ]);

    return { message: 'Password changed successfully' };
  }
}
