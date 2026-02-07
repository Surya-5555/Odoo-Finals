import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class AdminSeedService implements OnModuleInit {
  private readonly logger = new Logger(AdminSeedService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    const name = process.env.ADMIN_NAME ?? 'Admin';

    if (!email || !password) {
      this.logger.log(
        'ADMIN_EMAIL/ADMIN_PASSWORD not set; skipping default admin creation',
      );
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
      await this.prisma.user.update({
        where: { id: existingByEmail.id },
        data: { role: 'ADMIN' },
      });
      this.logger.log(`Promoted existing user to ADMIN: ${email}`);
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    this.logger.log(`Created default ADMIN user: ${email}`);
  }
}
