import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ThrottlerModule } from '@nestjs/throttler';
import { PassportModule } from '@nestjs/passport';
import { AdminSeedService } from './seed/admin-seed.service';

@Module({
  imports : [
    PassportModule,
    JwtModule.registerAsync({
      imports : [ConfigModule],
      inject : [ConfigService], // Can be able to read the variables from .env
      useFactory : (config : ConfigService) => ({ 
        secret : config.get('JWT_SECRET'),
        signOptions : { expiresIn : config.get('JWT_EXPIRES_IN')},
      }),
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 5, // 5 requests per minute
      },
    ]),
  ],  

  controllers: [AuthController], // Handles HTTP requests
  providers: [AuthService, PrismaService, JwtStrategy, AdminSeedService] // Shared functionality
  
})

export class AuthModule {}
