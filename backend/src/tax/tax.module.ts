import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TaxController } from './tax.controller';
import { TaxService } from './tax.service';

@Module({
  controllers: [TaxController],
  providers: [TaxService, PrismaService],
})
export class TaxModule {}
