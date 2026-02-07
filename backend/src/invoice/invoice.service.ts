import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InvoiceState, Prisma } from '@prisma/client';

@Injectable()
export class InvoiceService {
  constructor(private readonly prisma: PrismaService) {}

  private addBillingPeriod(
    from: Date,
    unit: 'DAY' | 'MONTH' | 'YEAR',
    value: number,
  ): Date {
    const next = new Date(from);
    if (unit === 'MONTH') next.setMonth(next.getMonth() + value);
    else if (unit === 'YEAR') next.setFullYear(next.getFullYear() + value);
    else next.setDate(next.getDate() + value);
    return next;
  }

  private async computeNextInvoiceDate(
    client: Prisma.TransactionClient,
    recurringPlanId: number,
    baseDate: Date,
  ): Promise<Date | null> {
    const defaultPrice =
      (await client.recurringPlanPrice.findFirst({
        where: { recurringPlanId, isDefault: true },
        select: { billingPeriodUnit: true, billingPeriodValue: true },
      })) ||
      (await client.recurringPlanPrice.findFirst({
        where: { recurringPlanId },
        select: { billingPeriodUnit: true, billingPeriodValue: true },
      }));

    if (!defaultPrice) return null;
    return this.addBillingPeriod(
      baseDate,
      defaultPrice.billingPeriodUnit,
      defaultPrice.billingPeriodValue,
    );
  }

  private async generateInvoiceNumber(): Promise<string> {
    const prefix = 'INV';
    const last = await this.prisma.invoice.findFirst({
      where: { number: { startsWith: prefix } },
      orderBy: { id: 'desc' },
      select: { number: true },
    });
    const nextNum = last
      ? parseInt(last.number.replace(prefix, ''), 10) + 1
      : 1;
    return `${prefix}${String(nextNum).padStart(3, '0')}`;
  }

  async createFromSubscription(
    subscriptionId: number,
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;
    const sub = await client.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        lines: { include: { product: true } },
        contact: true,
        paymentTerm: true,
      },
    });
    if (!sub) throw new NotFoundException('Subscription not found');
    if (sub.state !== 'CONFIRMED' && sub.state !== 'PAUSED') {
      throw new BadRequestException(
        'Invoice can only be created for confirmed or paused subscriptions',
      );
    }
    if (sub.lines.length === 0) {
      throw new BadRequestException(
        'Subscription has no order lines to invoice',
      );
    }

    const number = await this.generateInvoiceNumber();
    const invoiceDate = new Date();
    const dueDate = new Date(invoiceDate);
    if (sub.paymentTerm?.dueAfterDays) {
      dueDate.setDate(dueDate.getDate() + sub.paymentTerm.dueAfterDays);
    } else {
      dueDate.setDate(dueDate.getDate() + 30);
    }

    const invoice = await client.invoice.create({
      data: {
        number,
        subscriptionId: sub.id,
        contactId: sub.contactId,
        invoiceDate,
        dueDate,
        state: 'DRAFT',
        lines: {
          create: sub.lines.map((l) => ({
            productId: l.productId,
            description: l.product.name,
            quantity: l.quantity,
            unitPrice: l.unitPrice,
            discountPercent: l.discountPercent,
            discountFixed: l.discountFixed,
            discountId: l.discountId,
            taxPercent: l.taxPercent,
            taxId: l.taxId,
            amount: l.amount,
          })),
        },
      },
      include: {
        contact: true,
        subscription: true,
        lines: { include: { product: true } },
      },
    });
    return this.serializeInvoice(invoice);
  }

  async createInvoiceAndAdvance(subscriptionId: number) {
    return this.prisma.$transaction(async (tx) => {
      const sub = await tx.subscription.findUnique({
        where: { id: subscriptionId },
        select: {
          id: true,
          state: true,
          nextInvoiceDate: true,
          recurringPlanId: true,
        },
      });
      if (!sub) throw new NotFoundException('Subscription not found');

      const invoice = await this.createFromSubscription(subscriptionId, tx);

      const baseDate = sub.nextInvoiceDate ?? new Date();
      const nextInvoiceDate = await this.computeNextInvoiceDate(
        tx,
        sub.recurringPlanId,
        baseDate,
      );

      await tx.subscription.update({
        where: { id: subscriptionId },
        data: { nextInvoiceDate },
      });

      return invoice;
    });
  }

  async createDueInvoiceAndAdvance(subscriptionId: number) {
    return this.prisma.$transaction(async (tx) => {
      const now = new Date();
      const sub = await tx.subscription.findUnique({
        where: { id: subscriptionId },
        select: {
          id: true,
          state: true,
          nextInvoiceDate: true,
          recurringPlanId: true,
        },
      });
      if (!sub) throw new NotFoundException('Subscription not found');
      if (sub.state !== 'CONFIRMED') {
        throw new BadRequestException('Only confirmed subscriptions are due');
      }
      if (!sub.nextInvoiceDate || sub.nextInvoiceDate > now) {
        throw new BadRequestException('Subscription is not due for invoicing');
      }

      const invoice = await this.createFromSubscription(subscriptionId, tx);
      const nextInvoiceDate = await this.computeNextInvoiceDate(
        tx,
        sub.recurringPlanId,
        sub.nextInvoiceDate,
      );
      await tx.subscription.update({
        where: { id: subscriptionId },
        data: { nextInvoiceDate },
      });
      return invoice;
    });
  }

  private serializeInvoice(inv: {
    lines: {
      amount: unknown;
      unitPrice: unknown;
      quantity: unknown;
      taxPercent: unknown;
      discountPercent: unknown;
      discountFixed: unknown;
    }[];
    [k: string]: unknown;
  }) {
    const out = { ...inv } as Record<string, unknown>;
    if (Array.isArray(out.lines))
      out.lines = (out.lines as Record<string, unknown>[]).map((l) => ({
        ...l,
        amount: l.amount != null ? Number(l.amount) : l.amount,
        unitPrice: l.unitPrice != null ? Number(l.unitPrice) : l.unitPrice,
        quantity: l.quantity != null ? Number(l.quantity) : l.quantity,
        taxPercent: l.taxPercent != null ? Number(l.taxPercent) : l.taxPercent,
        discountPercent:
          l.discountPercent != null
            ? Number(l.discountPercent)
            : l.discountPercent,
        discountFixed:
          l.discountFixed != null ? Number(l.discountFixed) : l.discountFixed,
      }));
    return out;
  }

  async findAll(params?: {
    skip?: number;
    take?: number;
    subscriptionId?: number;
    contactId?: number;
    state?: InvoiceState;
    requestingUser?: { id: number; role: string };
  }) {
    const { skip, take, subscriptionId, contactId, state, requestingUser } =
      params ?? {};
    const where: Prisma.InvoiceWhereInput = {};
    if (requestingUser?.role === 'PORTAL') {
      where.contact = { userId: requestingUser.id };
    } else {
      if (subscriptionId != null) where.subscriptionId = subscriptionId;
      if (contactId != null) where.contactId = contactId;
    }
    if (state) where.state = state;
    const [data, total] = await Promise.all([
      this.prisma.invoice.findMany({
        skip,
        take: take ?? 50,
        where,
        include: {
          contact: true,
          subscription: true,
          lines: { include: { product: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.invoice.count({ where }),
    ]);
    return { data: data.map((i) => this.serializeInvoice(i)), total };
  }

  async findOne(id: number) {
    return this.findOneScoped(id);
  }

  async findOneScoped(
    id: number,
    requestingUser?: { id: number; role: string },
  ) {
    const inv = await this.prisma.invoice.findFirst({
      where: {
        id,
        ...(requestingUser?.role === 'PORTAL'
          ? { contact: { userId: requestingUser.id } }
          : {}),
      },
      include: {
        contact: true,
        subscription: true,
        lines: { include: { product: true } },
      },
    });
    if (!inv) throw new NotFoundException('Invoice not found');
    return this.serializeInvoice(inv);
  }

  async confirm(id: number) {
    const inv = await this.prisma.invoice.findUnique({ where: { id } });
    if (!inv) throw new NotFoundException('Invoice not found');
    if (inv.state !== 'DRAFT') {
      throw new BadRequestException('Only draft invoices can be confirmed');
    }
    const updated = await this.prisma.invoice.update({
      where: { id },
      data: { state: 'CONFIRMED' },
      include: {
        contact: true,
        subscription: true,
        lines: { include: { product: true } },
      },
    });
    return this.serializeInvoice(updated);
  }

  async markPaid(id: number) {
    const inv = await this.prisma.invoice.findUnique({ where: { id } });
    if (!inv) throw new NotFoundException('Invoice not found');
    if (inv.state !== 'CONFIRMED') {
      throw new BadRequestException(
        'Only confirmed invoices can be marked paid',
      );
    }
    const updated = await this.prisma.invoice.update({
      where: { id },
      data: { state: 'PAID' },
      include: {
        contact: true,
        subscription: true,
        lines: { include: { product: true } },
      },
    });
    return this.serializeInvoice(updated);
  }

  async cancel(id: number) {
    const inv = await this.prisma.invoice.findUnique({ where: { id } });
    if (!inv) throw new NotFoundException('Invoice not found');
    if (inv.state === 'PAID') {
      throw new BadRequestException('Paid invoices cannot be cancelled');
    }
    if (inv.state === 'CANCELLED') {
      return this.findOne(id);
    }
    const updated = await this.prisma.invoice.update({
      where: { id },
      data: { state: 'CANCELLED' },
      include: {
        contact: true,
        subscription: true,
        lines: { include: { product: true } },
      },
    });
    return this.serializeInvoice(updated);
  }
}
