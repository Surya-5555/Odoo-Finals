import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReportService {
  constructor(private readonly prisma: PrismaService) {}

  async summary() {
    const now = new Date();

    const [
      activeSubscriptions,
      subscriptionsTotal,
      invoiceCounts,
      overdueInvoices,
      paymentAgg,
    ] = await Promise.all([
      this.prisma.subscription.count({ where: { state: 'CONFIRMED' } }),
      this.prisma.subscription.count(),
      this.prisma.invoice.groupBy({
        by: ['state'],
        _count: { _all: true },
      }),
      this.prisma.invoice.count({
        where: {
          state: 'CONFIRMED',
          dueDate: { lt: now },
        },
      }),
      this.prisma.payment.aggregate({
        _sum: { amount: true },
        _count: { _all: true },
      }),
    ]);

    const invoicesByState = invoiceCounts.reduce<Record<string, number>>(
      (acc, row) => {
        acc[row.state] = row._count._all;
        return acc;
      },
      {},
    );

    return {
      subscriptions: {
        total: subscriptionsTotal,
        active: activeSubscriptions,
      },
      invoices: {
        byState: invoicesByState,
        overdueConfirmed: overdueInvoices,
      },
      payments: {
        count: paymentAgg._count._all,
        revenue:
          paymentAgg._sum.amount != null ? Number(paymentAgg._sum.amount) : 0,
      },
    };
  }
}
