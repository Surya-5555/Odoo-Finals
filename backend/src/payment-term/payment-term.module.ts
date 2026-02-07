import { Module } from '@nestjs/common';
import { PaymentTermService } from './payment-term.service';
import { PaymentTermController } from './payment-term.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [PaymentTermController],
  providers: [PaymentTermService, PrismaService],
  exports: [PaymentTermService],
})
export class PaymentTermModule {}
