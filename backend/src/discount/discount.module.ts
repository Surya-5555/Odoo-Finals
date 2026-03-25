import { Module } from '@nestjs/common';
<<<<<<< HEAD
import { PrismaService } from '../../prisma/prisma.service';
=======
>>>>>>> 34d8f0563272fc3ffddc6ac63922119f2dfd0da5
import { DiscountController } from './discount.controller';
import { DiscountService } from './discount.service';

@Module({
  controllers: [DiscountController],
<<<<<<< HEAD
  providers: [DiscountService, PrismaService],
=======
  providers: [DiscountService],
  exports: [DiscountService],
>>>>>>> 34d8f0563272fc3ffddc6ac63922119f2dfd0da5
})
export class DiscountModule {}
