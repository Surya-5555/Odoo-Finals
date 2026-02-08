import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../../prisma/prisma.service';
import { randomBytes } from 'crypto';

@Injectable()
export class AdminSeedService implements OnModuleInit {
  private readonly logger = new Logger(AdminSeedService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    /**
     * Security / production notes:
     * - We DO NOT accept an admin password via environment variables.
     *   Env vars often end up in CI logs, container inspect output, crash dumps, etc.
     * - If no admin exists, we generate a one-time random password using crypto,
     *   hash it with bcrypt, store ONLY the hash, and print the password ONCE.
     * - The flow is idempotent: if any ADMIN already exists, nothing is created
     *   and no password is printed.
     * - We refuse to overwrite the password of an existing user with ADMIN_EMAIL.
     *   This avoids surprising credential resets in production.
     */

    const email = process.env.ADMIN_EMAIL;
    const name = process.env.ADMIN_NAME ?? 'Admin';

    if (!email) {
      this.logger.log('ADMIN_EMAIL not set; skipping admin bootstrap');
      return;
    }

    const existingAdmin = await this.prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });

    if (existingAdmin) {
      return;
    }

    const existingByEmail = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingByEmail) {
      // Safer default: do not change passwords implicitly.
      // If you want to promote this user, do it explicitly (DB update / admin tooling).
      this.logger.error(
        `Admin bootstrap blocked: user with email ${email} already exists. ` +
          'Refusing to overwrite credentials. Choose a different ADMIN_EMAIL or promote manually.',
      );
      return;
    }

    // 24 bytes => 32 chars in base64url; strong enough for a bootstrap password.
    let generatedPassword = randomBytes(24).toString('base64url');
    const hashedPassword = await bcrypt.hash(generatedPassword, 12);

    try {
      await this.prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: 'ADMIN',
        },
      });
    } catch (error: any) {
      // If multiple instances start concurrently, another instance might have created the user.
      // In that case, we should not print the password because we can't guarantee which one won.
      this.logger.error(
        'Admin bootstrap creation failed (possibly due to concurrent startup). ' +
          'No password will be printed. Check the database for an ADMIN user.',
        error,
      );
      return;
    }

    // Print ONLY once, only when we successfully created the admin.
    // WARNING: In real enterprise setups, prefer writing this secret to a secure secret manager
    // or a one-time delivery channel instead of logs.

    console.log(
      `\n=== ADMIN BOOTSTRAP PASSWORD (DISPLAYED ONCE) ===\n` +
        `email: ${email}\n` +
        `password: ${generatedPassword}\n` +
        `==============================================\n`,
    );

    // Best-effort: drop the plaintext reference as soon as possible.
    generatedPassword = '***REDACTED***';

    this.logger.log(`Created initial ADMIN user: ${email}`);
  }
}
