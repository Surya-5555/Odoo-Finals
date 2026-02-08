import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InvoiceState, PaymentMethod, Prisma } from '@prisma/client';

@Injectable()
export class InvoiceService {
  constructor(private readonly prisma: PrismaService) {}

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

  async createFromSubscription(subscriptionId: number) {
    const sub = await this.prisma.subscription.findUnique({
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

    const invoice = await this.prisma.invoice.create({
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
            taxPercent: l.taxPercent,
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

  private serializeInvoice(inv: {
    lines: {
      amount: unknown;
      unitPrice: unknown;
      quantity: unknown;
      taxPercent: unknown;
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
      }));
    return out;
  }

  async findAll(params?: {
    skip?: number;
    take?: number;
    subscriptionId?: number;
    contactId?: number;
    state?: InvoiceState;
  }) {
    const { skip, take, subscriptionId, contactId, state } = params ?? {};
    const where: Prisma.InvoiceWhereInput = {};
    if (subscriptionId != null) where.subscriptionId = subscriptionId;
    if (contactId != null) where.contactId = contactId;
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
    const inv = await this.prisma.invoice.findUnique({
      where: { id },
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

  async cancel(id: number) {
    const inv = await this.prisma.invoice.findUnique({ where: { id } });
    if (!inv) throw new NotFoundException('Invoice not found');
    if (inv.state === 'PAID') {
      throw new BadRequestException('Paid invoices cannot be cancelled');
    }
    if (inv.state === 'CANCELLED') {
      throw new BadRequestException('Invoice already cancelled');
    }

    const updated = await this.prisma.invoice.update({
      where: { id },
      data: {
        state: 'CANCELLED',
        paymentMethod: null,
        paymentDate: null,
      },
      include: {
        contact: true,
        subscription: true,
        lines: { include: { product: true } },
      },
    });

    return this.serializeInvoice(updated);
  }

  async restoreToDraft(id: number) {
    const inv = await this.prisma.invoice.findUnique({ where: { id } });
    if (!inv) throw new NotFoundException('Invoice not found');
    if (inv.state !== 'CANCELLED') {
      throw new BadRequestException('Only cancelled invoices can be restored');
    }

    const updated = await this.prisma.invoice.update({
      where: { id },
      data: {
        state: 'DRAFT',
      },
      include: {
        contact: true,
        subscription: true,
        lines: { include: { product: true } },
      },
    });
    return this.serializeInvoice(updated);
  }

  async markPaid(
    id: number,
    params?: { paymentMethod?: PaymentMethod; paymentDate?: Date },
  ) {
    const inv = await this.prisma.invoice.findUnique({ where: { id } });
    if (!inv) throw new NotFoundException('Invoice not found');
    if (inv.state !== 'CONFIRMED') {
      throw new BadRequestException(
        'Only confirmed invoices can be marked paid',
      );
    }
    const updated = await this.prisma.invoice.update({
      where: { id },
      data: {
        state: 'PAID',
        paymentMethod: params?.paymentMethod ?? null,
        paymentDate: params?.paymentDate ?? null,
      },
      include: {
        contact: true,
        subscription: true,
        lines: { include: { product: true } },
      },
    });
    return this.serializeInvoice(updated);
  }
}
