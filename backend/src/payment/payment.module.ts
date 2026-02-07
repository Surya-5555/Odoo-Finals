import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';

@Module({
  controllers: [PaymentController],
  providers: [PaymentService, PrismaService],
})
export class PaymentModule {}
