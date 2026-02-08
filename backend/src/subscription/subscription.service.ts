import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InvoiceService } from '../invoice/invoice.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { UpsellSubscriptionDto } from './dto/upsell-subscription.dto';
import { SubscriptionState } from '@prisma/client';
import { Prisma } from '@prisma/client';

@Injectable()
export class SubscriptionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly invoiceService: InvoiceService,
  ) {}

  private async generateSubscriptionNumber(): Promise<string> {
    const prefix = 'Sub';
    const last = await this.prisma.subscription.findFirst({
      where: { number: { startsWith: prefix } },
      orderBy: { id: 'desc' },
      select: { number: true },
    });
    const nextNum = last
      ? parseInt(last.number.replace(prefix, ''), 10) + 1
      : 1;
    return `${prefix}${String(nextNum).padStart(3, '0')}`;
  }

  private computeLineAmount(
    quantity: number,
    unitPrice: number,
    discountPercent?: number,
    taxPercent?: number,
  ): number {
    let amount = quantity * unitPrice;
    if (discountPercent) amount *= 1 - discountPercent / 100;
    if (taxPercent) amount *= 1 + taxPercent / 100;
    return Math.round(amount * 100) / 100;
  }

  private async getValidDiscountOrThrow(code: string) {
    const normalized = code.trim().toUpperCase();
    if (!normalized) throw new BadRequestException('Discount code required');

    const d = await this.prisma.discount.findUnique({
      where: { code: normalized },
    });
    if (!d || !d.isActive) throw new BadRequestException('Invalid discount code');

    const t = new Date();
    if (d.startsAt && t < d.startsAt)
      throw new BadRequestException('Discount not active yet');
    if (d.endsAt && t > d.endsAt)
      throw new BadRequestException('Discount expired');

    if (d.limitUsage) {
      if (!d.usageLimit || d.usageLimit < 1) {
        throw new BadRequestException('Discount misconfigured: usageLimit missing');
      }
      if (d.timesUsed >= d.usageLimit) {
        throw new BadRequestException('Discount usage limit reached');
      }
    }

    return d;
  }

  async create(dto: CreateSubscriptionDto) {
    const number = await this.generateSubscriptionNumber();
    const contact = await this.prisma.contact.findUnique({
      where: { id: dto.contactId },
    });
    if (!contact) throw new NotFoundException('Contact not found');
    const plan = await this.prisma.recurringPlan.findUnique({
      where: { id: dto.recurringPlanId },
      include: { prices: true },
    });
    if (!plan) throw new NotFoundException('Recurring plan not found');

    const portalDiscountCode = dto.portal?.discountCode?.trim();
    const discount = portalDiscountCode
      ? await this.getValidDiscountOrThrow(portalDiscountCode)
      : null;
    const discountPercent = discount ? Number(discount.percent) : null;

    const lines = dto.lines ?? [];
    if (discount && lines.length === 0) {
      throw new BadRequestException(
        'Discount code cannot be applied without order lines',
      );
    }

    if (discount?.productId != null) {
      const hasEligible = lines.some((l) => l.productId === discount.productId);
      if (!hasEligible) {
        throw new BadRequestException(
          'Discount not applicable to selected products',
        );
      }
    }

    const lineCreates: Prisma.SubscriptionLineCreateWithoutSubscriptionInput[] =
      [];
    for (const line of lines) {
      const product = await this.prisma.product.findUnique({
        where: { id: line.productId },
      });
      if (!product)
        throw new NotFoundException(`Product ${line.productId} not found`);

      const effectiveDiscountPercent =
        line.discountPercent != null
          ? line.discountPercent
          : discount && discountPercent != null
            ? discount.productId == null || discount.productId === line.productId
              ? discountPercent
              : undefined
            : undefined;

      const amount = this.computeLineAmount(
        line.quantity,
        line.unitPrice,
        effectiveDiscountPercent,
        line.taxPercent,
      );
      lineCreates.push({
        product: { connect: { id: line.productId } },
        quantity: new Prisma.Decimal(line.quantity),
        unitPrice: new Prisma.Decimal(line.unitPrice),
        discountPercent:
          effectiveDiscountPercent != null
            ? new Prisma.Decimal(effectiveDiscountPercent)
            : null,
        taxPercent: line.taxPercent
          ? new Prisma.Decimal(line.taxPercent)
          : null,
        amount: new Prisma.Decimal(amount),
      });
    }

    const subscription = await this.prisma.$transaction(async (tx) => {
      const created = await tx.subscription.create({
        data: {
          number,
          contactId: dto.contactId,
          recurringPlanId: dto.recurringPlanId,
          state: 'DRAFT',
          expirationDate: dto.expirationDate
            ? new Date(dto.expirationDate)
            : undefined,
          quotationTemplateId: dto.quotationTemplateId ?? undefined,
          orderDate: dto.orderDate ? new Date(dto.orderDate) : undefined,
          paymentTermId: dto.paymentTermId ?? undefined,
          salespersonId: dto.salespersonId ?? undefined,
          lines: lineCreates.length ? { create: lineCreates } : undefined,
        },
        include: {
          contact: true,
          recurringPlan: { include: { prices: true } },
          lines: { include: { product: true } },
          paymentTerm: true,
        },
      });

      if (discount?.limitUsage) {
        await tx.discount.update({
          where: { id: discount.id },
          data: { timesUsed: { increment: 1 } },
        });
      }

      return created;
    });
    return this.serializeSubscription(subscription);
  }

  private serializeSubscription(sub: {
    lines: {
      product: unknown;
      quantity: unknown;
      unitPrice: unknown;
      amount: unknown;
      discountPercent: unknown;
      taxPercent: unknown;
    }[];
    recurringPlan: { prices: { price: unknown }[] };
    [k: string]: unknown;
  }) {
    const rec = { ...sub } as Record<string, unknown>;
    if (rec.recurringPlan && typeof rec.recurringPlan === 'object') {
      const rp = rec.recurringPlan as Record<string, unknown>;
      if (Array.isArray(rp.prices))
        rp.prices = rp.prices.map((p: { price: unknown }) =>
          typeof p === 'object' && p && 'price' in p
            ? { ...p, price: Number(p.price) }
            : p,
        );
    }
    if (Array.isArray(rec.lines))
      rec.lines = rec.lines.map((l: Record<string, unknown>) => ({
        ...l,
        quantity: l.quantity != null ? Number(l.quantity) : l.quantity,
        unitPrice: l.unitPrice != null ? Number(l.unitPrice) : l.unitPrice,
        amount: l.amount != null ? Number(l.amount) : l.amount,
        discountPercent:
          l.discountPercent != null
            ? Number(l.discountPercent)
            : l.discountPercent,
        taxPercent: l.taxPercent != null ? Number(l.taxPercent) : l.taxPercent,
      }));
    return rec;
  }

  async findAll(params?: {
    skip?: number;
    take?: number;
    contactId?: number;
    state?: SubscriptionState;
  }) {
    const { skip, take, contactId, state } = params ?? {};
    const where: Prisma.SubscriptionWhereInput = {};
    if (contactId != null) where.contactId = contactId;
    if (state) where.state = state;
    const [items, total] = await Promise.all([
      this.prisma.subscription.findMany({
        skip,
        take: take ?? 50,
        where,
        include: {
          contact: true,
          recurringPlan: { include: { prices: true } },
          lines: { include: { product: true } },
          paymentTerm: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.subscription.count({ where }),
    ]);
    return {
      data: items.map((s) => this.serializeSubscription(s)),
      total,
    };
  }

  async findOne(id: number) {
    const sub = await this.prisma.subscription.findUnique({
      where: { id },
      include: {
        contact: true,
        recurringPlan: { include: { prices: true } },
        lines: { include: { product: true } },
        paymentTerm: true,
        quotationTemplate: true,
        invoices: true,
      },
    });
    if (!sub) throw new NotFoundException('Subscription not found');
    return this.serializeSubscription(sub);
  }

  async findByNumber(number: string) {
    const sub = await this.prisma.subscription.findUnique({
      where: { number },
      include: {
        contact: true,
        recurringPlan: { include: { prices: true } },
        lines: { include: { product: true } },
        paymentTerm: true,
      },
    });
    if (!sub) throw new NotFoundException('Subscription not found');
    return this.serializeSubscription(sub);
  }

  async update(id: number, dto: UpdateSubscriptionDto) {
    await this.findOne(id);
    const data: Prisma.SubscriptionUpdateInput = {
      ...(dto.contactId !== undefined && { contactId: dto.contactId }),
      ...(dto.recurringPlanId !== undefined && {
        recurringPlanId: dto.recurringPlanId,
      }),
      ...(dto.expirationDate !== undefined && {
        expirationDate: new Date(dto.expirationDate),
      }),
      ...(dto.quotationTemplateId !== undefined && {
        quotationTemplateId: dto.quotationTemplateId,
      }),
      ...(dto.orderDate !== undefined && {
        orderDate: new Date(dto.orderDate),
      }),
      ...(dto.paymentTermId !== undefined && {
        paymentTermId: dto.paymentTermId,
      }),
      ...(dto.salespersonId !== undefined && {
        salespersonId: dto.salespersonId,
      }),
    };
    if (dto.lines !== undefined) {
      await this.prisma.subscriptionLine.deleteMany({
        where: { subscriptionId: id },
      });
      if (dto.lines.length) {
        const creates: Prisma.SubscriptionLineCreateWithoutSubscriptionInput[] =
          [];
        for (const line of dto.lines) {
          const product = await this.prisma.product.findUnique({
            where: { id: line.productId },
          });
          if (!product)
            throw new NotFoundException(`Product ${line.productId} not found`);
          const amount = this.computeLineAmount(
            line.quantity,
            line.unitPrice,
            line.discountPercent,
            line.taxPercent,
          );
          creates.push({
            product: { connect: { id: line.productId } },
            quantity: new Prisma.Decimal(line.quantity),
            unitPrice: new Prisma.Decimal(line.unitPrice),
            discountPercent: line.discountPercent
              ? new Prisma.Decimal(line.discountPercent)
              : null,
            taxPercent: line.taxPercent
              ? new Prisma.Decimal(line.taxPercent)
              : null,
            amount: new Prisma.Decimal(amount),
          });
        }
        data.lines = { create: creates };
      }
    }
    const updated = await this.prisma.subscription.update({
      where: { id },
      data,
      include: {
        contact: true,
        recurringPlan: { include: { prices: true } },
        lines: { include: { product: true } },
        paymentTerm: true,
      },
    });
    return this.serializeSubscription(updated);
  }

  async send(id: number) {
    const sub = await this.prisma.subscription.findUnique({
      where: { id },
      include: { recurringPlan: true },
    });
    if (!sub) throw new NotFoundException('Subscription not found');
    if (sub.state !== 'DRAFT') {
      throw new BadRequestException('Only draft subscriptions can be sent');
    }
    return this.prisma.subscription
      .update({
        where: { id },
        data: { state: 'QUOTATION_SENT' },
        include: {
          contact: true,
          recurringPlan: { include: { prices: true } },
          lines: { include: { product: true } },
        },
      })
      .then((s) => this.serializeSubscription(s));
  }

  async confirm(id: number) {
    const sub = await this.prisma.subscription.findUnique({
      where: { id },
      include: { recurringPlan: { include: { prices: true } } },
    });
    if (!sub) throw new NotFoundException('Subscription not found');
    if (sub.state !== 'DRAFT' && sub.state !== 'QUOTATION_SENT') {
      throw new BadRequestException(
        'Only draft or quotation-sent subscriptions can be confirmed',
      );
    }
    const now = new Date();
    const startDate = sub.orderDate ?? now;
    let nextInvoiceDate: Date | null = null;
    const defaultPrice =
      (await this.prisma.recurringPlanPrice.findFirst({
        where: {
          recurringPlanId: sub.recurringPlanId,
          isDefault: true,
        },
      })) ||
      (await this.prisma.recurringPlanPrice.findFirst({
        where: { recurringPlanId: sub.recurringPlanId },
      }));
    if (defaultPrice) {
      const next = new Date(startDate);
      if (defaultPrice.billingPeriodUnit === 'MONTH')
        next.setMonth(next.getMonth() + defaultPrice.billingPeriodValue);
      else if (defaultPrice.billingPeriodUnit === 'YEAR')
        next.setFullYear(next.getFullYear() + defaultPrice.billingPeriodValue);
      else if (defaultPrice.billingPeriodUnit === 'DAY')
        next.setDate(next.getDate() + defaultPrice.billingPeriodValue);
      nextInvoiceDate = next;
    }
    const updated = await this.prisma.subscription.update({
      where: { id },
      data: {
        state: 'CONFIRMED',
        orderDate: sub.orderDate ?? now,
        startDate,
        nextInvoiceDate,
      },
      include: {
        contact: true,
        recurringPlan: { include: { prices: true } },
        lines: { include: { product: true } },
        paymentTerm: true,
      },
    });
    return this.serializeSubscription(updated);
  }

  async renew(id: number) {
    const sub = await this.prisma.subscription.findUnique({
      where: { id },
      include: { lines: true, recurringPlan: true },
    });
    if (!sub) throw new NotFoundException('Subscription not found');
    if (sub.state !== 'CONFIRMED' && sub.state !== 'PAUSED') {
      throw new BadRequestException(
        'Only confirmed or paused subscriptions can be renewed',
      );
    }
    const plan = sub.recurringPlan;
    if (!plan.renewable) {
      throw new BadRequestException('This plan is not renewable');
    }
    const number = await this.generateSubscriptionNumber();
    const now = new Date();
    let nextInvoiceDate: Date | null = null;
    const defaultPrice =
      (await this.prisma.recurringPlanPrice.findFirst({
        where: {
          recurringPlanId: plan.id,
          isDefault: true,
        },
      })) ||
      (await this.prisma.recurringPlanPrice.findFirst({
        where: { recurringPlanId: plan.id },
      }));
    if (defaultPrice) {
      const next = new Date(now);
      if (defaultPrice.billingPeriodUnit === 'MONTH')
        next.setMonth(next.getMonth() + defaultPrice.billingPeriodValue);
      else if (defaultPrice.billingPeriodUnit === 'YEAR')
        next.setFullYear(next.getFullYear() + defaultPrice.billingPeriodValue);
      else if (defaultPrice.billingPeriodUnit === 'DAY')
        next.setDate(next.getDate() + defaultPrice.billingPeriodValue);
      nextInvoiceDate = next;
    }
    const newSub = await this.prisma.subscription.create({
      data: {
        number,
        contactId: sub.contactId,
        recurringPlanId: sub.recurringPlanId,
        state: 'CONFIRMED',
        orderDate: now,
        startDate: now,
        nextInvoiceDate,
        paymentTermId: sub.paymentTermId,
        salespersonId: sub.salespersonId,
        lines: {
          create: sub.lines.map((l) => ({
            productId: l.productId,
            quantity: l.quantity,
            unitPrice: l.unitPrice,
            discountPercent: l.discountPercent,
            taxPercent: l.taxPercent,
            amount: l.amount,
          })),
        },
      },
      include: {
        contact: true,
        recurringPlan: { include: { prices: true } },
        lines: { include: { product: true } },
        paymentTerm: true,
      },
    });
    return this.serializeSubscription(newSub);
  }

  async close(id: number) {
    const sub = await this.prisma.subscription.findUnique({
      where: { id },
      include: { recurringPlan: true },
    });
    if (!sub) throw new NotFoundException('Subscription not found');
    if (sub.state !== 'CONFIRMED' && sub.state !== 'PAUSED') {
      throw new BadRequestException(
        'Only confirmed or paused subscriptions can be closed',
      );
    }
    if (!sub.recurringPlan.closable) {
      throw new BadRequestException('This plan does not allow closing');
    }
    const updated = await this.prisma.subscription.update({
      where: { id },
      data: { state: 'CLOSED' },
      include: {
        contact: true,
        recurringPlan: { include: { prices: true } },
        lines: { include: { product: true } },
      },
    });
    return this.serializeSubscription(updated);
  }

  async pause(id: number) {
    const sub = await this.prisma.subscription.findUnique({
      where: { id },
      include: { recurringPlan: true },
    });
    if (!sub) throw new NotFoundException('Subscription not found');
    if (sub.state !== 'CONFIRMED') {
      throw new BadRequestException(
        'Only confirmed subscriptions can be paused',
      );
    }
    if (!sub.recurringPlan.pausable) {
      throw new BadRequestException('This plan is not pausable');
    }
    const updated = await this.prisma.subscription.update({
      where: { id },
      data: { state: 'PAUSED' },
      include: {
        contact: true,
        recurringPlan: { include: { prices: true } },
        lines: { include: { product: true } },
      },
    });
    return this.serializeSubscription(updated);
  }

  async resume(id: number) {
    const sub = await this.prisma.subscription.findUnique({ where: { id } });
    if (!sub) throw new NotFoundException('Subscription not found');
    if (sub.state !== 'PAUSED') {
      throw new BadRequestException('Only paused subscriptions can be resumed');
    }
    const updated = await this.prisma.subscription.update({
      where: { id },
      data: { state: 'CONFIRMED' },
      include: {
        contact: true,
        recurringPlan: { include: { prices: true } },
        lines: { include: { product: true } },
      },
    });
    return this.serializeSubscription(updated);
  }

  async remove(id: number) {
    const sub = await this.prisma.subscription.findUnique({
      where: { id },
      include: { invoices: true },
    });
    if (!sub) throw new NotFoundException('Subscription not found');
    if (sub.state !== 'DRAFT' && sub.state !== 'QUOTATION_SENT') {
      throw new BadRequestException(
        'Only draft or quotation-sent subscriptions can be deleted',
      );
    }
    if (sub.invoices.length > 0) {
      throw new BadRequestException(
        'Cannot delete subscription with linked invoices',
      );
    }
    await this.prisma.subscription.delete({ where: { id } });
    return { success: true };
  }

  async createInvoice(subscriptionId: number) {
    return this.invoiceService.createFromSubscription(subscriptionId);
  }

  async upsell(id: number, dto: UpsellSubscriptionDto) {
    const sub = await this.prisma.subscription.findUnique({
      where: { id },
      include: { recurringPlan: true },
    });
    if (!sub) throw new NotFoundException('Subscription not found');
    if (sub.state !== 'CONFIRMED' && sub.state !== 'PAUSED') {
      throw new BadRequestException(
        'Only confirmed or paused subscriptions can be upsold',
      );
    }
    const planId = dto.recurringPlanId ?? sub.recurringPlanId;
    const plan = await this.prisma.recurringPlan.findUnique({
      where: { id: planId },
      include: { prices: true },
    });
    if (!plan) throw new NotFoundException('Recurring plan not found');
    if (dto.lines.length === 0) {
      throw new BadRequestException('Upsell must include at least one line');
    }

    const number = await this.generateSubscriptionNumber();
    const now = new Date();
    let nextInvoiceDate: Date | null = null;
    const defaultPrice =
      (await this.prisma.recurringPlanPrice.findFirst({
        where: { recurringPlanId: plan.id, isDefault: true },
      })) ||
      (await this.prisma.recurringPlanPrice.findFirst({
        where: { recurringPlanId: plan.id },
      }));
    if (defaultPrice) {
      const next = new Date(now);
      if (defaultPrice.billingPeriodUnit === 'MONTH')
        next.setMonth(next.getMonth() + defaultPrice.billingPeriodValue);
      else if (defaultPrice.billingPeriodUnit === 'YEAR')
        next.setFullYear(next.getFullYear() + defaultPrice.billingPeriodValue);
      else if (defaultPrice.billingPeriodUnit === 'DAY')
        next.setDate(next.getDate() + defaultPrice.billingPeriodValue);
      nextInvoiceDate = next;
    }

    const lineCreates: Prisma.SubscriptionLineCreateWithoutSubscriptionInput[] =
      [];
    for (const line of dto.lines) {
      const product = await this.prisma.product.findUnique({
        where: { id: line.productId },
      });
      if (!product)
        throw new NotFoundException(`Product ${line.productId} not found`);
      const amount = this.computeLineAmount(
        line.quantity,
        line.unitPrice,
        line.discountPercent,
        line.taxPercent,
      );
      lineCreates.push({
        product: { connect: { id: line.productId } },
        quantity: new Prisma.Decimal(line.quantity),
        unitPrice: new Prisma.Decimal(line.unitPrice),
        discountPercent: line.discountPercent
          ? new Prisma.Decimal(line.discountPercent)
          : null,
        taxPercent: line.taxPercent
          ? new Prisma.Decimal(line.taxPercent)
          : null,
        amount: new Prisma.Decimal(amount),
      });
    }

    const newSub = await this.prisma.subscription.create({
      data: {
        number,
        contactId: sub.contactId,
        recurringPlanId: planId,
        state: 'CONFIRMED',
        orderDate: now,
        startDate: now,
        nextInvoiceDate,
        paymentTermId: sub.paymentTermId,
        salespersonId: sub.salespersonId,
        lines: { create: lineCreates },
      },
      include: {
        contact: true,
        recurringPlan: { include: { prices: true } },
        lines: { include: { product: true } },
        paymentTerm: true,
      },
    });
    return this.serializeSubscription(newSub);
  }
}
