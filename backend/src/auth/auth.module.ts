import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ThrottlerModule } from '@nestjs/throttler';
import { PassportModule } from '@nestjs/passport';
import { AdminSeedService } from './seed/admin-seed.service';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    PassportModule,
    EmailModule,
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const env = (config.get('NODE_ENV') as string | undefined) ?? 'development';
        const isProd = env === 'production';

        // Global throttling should be loose to avoid breaking normal UI navigation.
        // Keep strict limits only on sensitive endpoints via @Throttle decorators.
        return [
          {
            ttl: 60_000,
            limit: isProd ? 300 : 10_000,
          },
        ];
      },
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService], // Can be able to read the variables from .env
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: config.get('JWT_EXPIRES_IN') },
      }),
    }),
  ],

  controllers: [AuthController], // Handles HTTP requests
  providers: [AuthService, JwtStrategy, AdminSeedService], // Shared functionality
})
export class AuthModule {}
