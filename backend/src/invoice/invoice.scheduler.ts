import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { InvoiceService } from './invoice.service';

@Injectable()
export class InvoiceScheduler {
  private readonly logger = new Logger(InvoiceScheduler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly invoiceService: InvoiceService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async generateDueInvoices() {
    const now = new Date();

    const dueSubscriptions = await this.prisma.subscription.findMany({
      where: {
        state: 'CONFIRMED',
        nextInvoiceDate: { not: null, lte: now },
      },
      select: { id: true },
      take: 200,
      orderBy: { nextInvoiceDate: 'asc' },
    });

    if (dueSubscriptions.length === 0) return;

    this.logger.log(`Found ${dueSubscriptions.length} due subscription(s)`);

    for (const sub of dueSubscriptions) {
      try {
        await this.invoiceService.createDueInvoiceAndAdvance(sub.id);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        this.logger.error(
          `Failed generating invoice for subscription ${sub.id}: ${message}`,
        );
      }
    }
  }
}
