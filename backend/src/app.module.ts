import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { JwtAuthGuard } from './auth/guard/jwt-auth.guard';
import { RecurringPlanModule } from './recurring-plan/recurring-plan.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { ContactModule } from './contact/contact.module';
import { ProductModule } from './product/product.module';
import { InvoiceModule } from './invoice/invoice.module';
import { PaymentTermModule } from './payment-term/payment-term.module';
import { QuotationTemplateModule } from './quotation-template/quotation-template.module';
import { TaxModule } from './tax/tax.module';
import { PrismaModule } from './prisma/prisma.module';
import { DiscountModule } from './discount/discount.module';
import { ReportingModule } from './reporting/reporting.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
      // Support starting the server from either repo root or the backend folder.
      envFilePath: ['.env', 'backend/.env'],
    }),
    AuthModule,
    RecurringPlanModule,
    SubscriptionModule,
    ContactModule,
    ProductModule,
    InvoiceModule,
    PaymentTermModule,
    QuotationTemplateModule,
    TaxModule,
    DiscountModule,
    ReportingModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
