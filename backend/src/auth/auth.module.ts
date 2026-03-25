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
<<<<<<< HEAD
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 5, // 5 requests per minute
      },
    ]),
  ],

  controllers: [AuthController], // Handles HTTP requests
  providers: [AuthService, PrismaService, JwtStrategy, AdminSeedService], // Shared functionality
=======
  ],

  controllers: [AuthController], // Handles HTTP requests
  providers: [AuthService, JwtStrategy, AdminSeedService], // Shared functionality
>>>>>>> 34d8f0563272fc3ffddc6ac63922119f2dfd0da5
})
export class AuthModule {}
