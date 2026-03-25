import { Module } from '@nestjs/common';
<<<<<<< HEAD
import { PrismaService } from '../../prisma/prisma.service';
=======
>>>>>>> 34d8f0563272fc3ffddc6ac63922119f2dfd0da5
import { TaxController } from './tax.controller';
import { TaxService } from './tax.service';

@Module({
  controllers: [TaxController],
<<<<<<< HEAD
  providers: [TaxService, PrismaService],
=======
  providers: [TaxService],
  exports: [TaxService],
>>>>>>> 34d8f0563272fc3ffddc6ac63922119f2dfd0da5
})
export class TaxModule {}
