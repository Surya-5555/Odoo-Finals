import { Module } from '@nestjs/common';
import { PaymentTermService } from './payment-term.service';
import { PaymentTermController } from './payment-term.controller';

@Module({
  controllers: [PaymentTermController],
  providers: [PaymentTermService],
  exports: [PaymentTermService],
})
export class PaymentTermModule {}
