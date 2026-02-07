import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Invoice, InvoiceLine, Payment } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

type PaymentWithInvoice = Payment & { invoice: Invoice };
type InvoiceWithLinesAndPayments = Invoice & {
  lines: InvoiceLine[];
  payments: Payment[];
};

type SerializedPayment = Omit<PaymentWithInvoice, 'amount'> & {
  amount: number | null;
};

@Injectable()
export class PaymentService {
  constructor(private readonly prisma: PrismaService) {}

  private serializePayment(payment: PaymentWithInvoice): SerializedPayment {
    return {
      ...payment,
      amount: payment.amount != null ? Number(payment.amount) : null,
    };
  }

  async create(dto: CreatePaymentDto) {
    const invoice = (await this.prisma.invoice.findUnique({
      where: { id: dto.invoiceId },
      include: {
        lines: true,
        payments: true,
      },
    })) as InvoiceWithLinesAndPayments | null;

    if (!invoice) throw new NotFoundException('Invoice not found');
    if (invoice.state === 'DRAFT') {
      throw new BadRequestException('Invoice must be confirmed before payment');
    }
    if (invoice.state === 'CANCELLED') {
      throw new BadRequestException('Cancelled invoice cannot be paid');
    }
    if (invoice.state === 'PAID') {
      throw new BadRequestException('Invoice is already paid');
    }

    const total = invoice.lines.reduce((sum, l) => sum + Number(l.amount), 0);
    const alreadyPaid = invoice.payments.reduce(
      (sum, p) => sum + Number(p.amount),
      0,
    );
    const outstanding = Math.max(
      0,
      Math.round((total - alreadyPaid) * 100) / 100,
    );

    const paymentAmount = Math.round(dto.amount * 100) / 100;

    if (paymentAmount > outstanding) {
      throw new BadRequestException('Payment exceeds outstanding amount');
    }

    const paymentDate = dto.paymentDate
      ? new Date(dto.paymentDate)
      : new Date();

    const shouldMarkPaid = paymentAmount === outstanding;

    const [payment] = (await this.prisma.$transaction([
      this.prisma.payment.create({
        data: {
          invoiceId: invoice.id,
          method: dto.method,
          amount: new Prisma.Decimal(paymentAmount),
          paymentDate,
        },
        include: { invoice: true },
      }),
      ...(shouldMarkPaid
        ? [
            this.prisma.invoice.update({
              where: { id: invoice.id },
              data: { state: 'PAID' },
            }),
          ]
        : []),
    ])) as unknown as [PaymentWithInvoice, ...unknown[]];

    return this.serializePayment(payment);
  }

  async findAll(params?: { skip?: number; take?: number; invoiceId?: number }) {
    const { skip, take, invoiceId } = params ?? {};
    const where: Prisma.PaymentWhereInput = {};
    if (invoiceId != null) where.invoiceId = invoiceId;

    const [data, total] = await Promise.all([
      this.prisma.payment.findMany({
        skip,
        take: take ?? 50,
        where,
        include: { invoice: true },
        orderBy: { paymentDate: 'desc' },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      data: (data as PaymentWithInvoice[]).map((p) => this.serializePayment(p)),
      total,
    };
  }

  async findOne(id: number) {
    const payment = (await this.prisma.payment.findUnique({
      where: { id },
      include: { invoice: true },
    })) as PaymentWithInvoice | null;
    if (!payment) throw new NotFoundException('Payment not found');
    return this.serializePayment(payment);
  }
}
