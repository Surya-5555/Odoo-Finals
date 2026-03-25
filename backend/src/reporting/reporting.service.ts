import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReportingService {
  constructor(private readonly prisma: PrismaService) {}

  async summary() {
    const [contacts, products, recurringPlans] = await Promise.all([
      this.prisma.contact.count(),
      this.prisma.product.count(),
      this.prisma.recurringPlan.count(),
    ]);

    const [subscriptionsByState, invoicesByState] = await Promise.all([
      this.prisma.subscription.groupBy({
        by: ['state'],
        _count: { _all: true },
      }),
      this.prisma.invoice.groupBy({
        by: ['state'],
        _count: { _all: true },
      }),
    ]);

    const paidRevenue = await this.prisma.invoiceLine.aggregate({
      where: {
        invoice: { state: 'PAID' },
      },
      _sum: { amount: true },
    });

    return {
      counts: {
        contacts,
        products,
        recurringPlans,
      },
      subscriptionsByState: Object.fromEntries(
        subscriptionsByState.map((x) => [x.state, x._count._all]),
      ),
      invoicesByState: Object.fromEntries(
        invoicesByState.map((x) => [x.state, x._count._all]),
      ),
      revenue: {
        paid: paidRevenue._sum.amount ? Number(paidRevenue._sum.amount) : 0,
      },
    };
  }
}
