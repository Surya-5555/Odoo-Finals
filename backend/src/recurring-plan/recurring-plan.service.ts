import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRecurringPlanDto } from './dto/create-recurring-plan.dto';
import { UpdateRecurringPlanDto } from './dto/update-recurring-plan.dto';
import { BillingPeriodUnit, Prisma } from '@prisma/client';

@Injectable()
export class RecurringPlanService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRecurringPlanDto) {
    const { prices, ...planData } = dto;
    const data: Prisma.RecurringPlanCreateInput = {
      name: planData.name,
      minQuantity: planData.minQuantity ?? 1,
      startDate: planData.startDate ? new Date(planData.startDate) : undefined,
      endDate: planData.endDate ? new Date(planData.endDate) : undefined,
      autoClose: planData.autoClose ?? false,
      autoCloseValidityDays: planData.autoCloseValidityDays ?? undefined,
      pausable: planData.pausable ?? true,
      renewable: planData.renewable ?? true,
      closable: planData.closable ?? true,
    };
    if (prices?.length) {
      data.prices = {
        create: prices.map((p) => ({
          price: new Prisma.Decimal(p.price),
          billingPeriodValue: p.billingPeriodValue,
          billingPeriodUnit: p.billingPeriodUnit as BillingPeriodUnit,
          isDefault: p.isDefault ?? false,
        })),
      };
    }
    return this.prisma.recurringPlan.create({
      data,
      include: { prices: true },
    });
  }

  async findAll(params?: {
    skip?: number;
    take?: number;
    where?: Prisma.RecurringPlanWhereInput;
  }) {
    const { skip, take, where } = params ?? {};
    const [items, total] = await Promise.all([
      this.prisma.recurringPlan.findMany({
        skip,
        take: take ?? 50,
        where,
        include: { prices: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.recurringPlan.count({ where }),
    ]);
    return {
      data: items.map((p) => ({
        ...p,
        prices: p.prices.map((r) => ({
          ...r,
          price: Number(r.price),
        })),
      })),
      total,
    };
  }

  async findOne(id: number) {
    const plan = await this.prisma.recurringPlan.findUnique({
      where: { id },
      include: { prices: true },
    });
    if (!plan) throw new NotFoundException('Recurring plan not found');
    return {
      ...plan,
      prices: plan.prices.map((p) => ({ ...p, price: Number(p.price) })),
    };
  }

  async update(id: number, dto: UpdateRecurringPlanDto) {
    await this.findOne(id);
    const { prices, ...planData } = dto;
    const data: Prisma.RecurringPlanUpdateInput = {
      ...(planData.name !== undefined && { name: planData.name }),
      ...(planData.minQuantity !== undefined && {
        minQuantity: planData.minQuantity,
      }),
      ...(planData.startDate !== undefined && {
        startDate: new Date(planData.startDate),
      }),
      ...(planData.endDate !== undefined && {
        endDate: new Date(planData.endDate),
      }),
      ...(planData.autoClose !== undefined && { autoClose: planData.autoClose }),
      ...(planData.autoCloseValidityDays !== undefined && {
        autoCloseValidityDays: planData.autoCloseValidityDays,
      }),
      ...(planData.pausable !== undefined && { pausable: planData.pausable }),
      ...(planData.renewable !== undefined && {
        renewable: planData.renewable,
      }),
      ...(planData.closable !== undefined && { closable: planData.closable }),
    };
    if (prices !== undefined) {
      await this.prisma.recurringPlanPrice.deleteMany({
        where: { recurringPlanId: id },
      });
      if (prices.length) {
        data.prices = {
          create: prices.map((p) => ({
            price: new Prisma.Decimal(p.price),
            billingPeriodValue: p.billingPeriodValue,
            billingPeriodUnit: p.billingPeriodUnit as BillingPeriodUnit,
            isDefault: p.isDefault ?? false,
          })),
        };
      }
    }
    const updated = await this.prisma.recurringPlan.update({
      where: { id },
      data,
      include: { prices: true },
    });
    return {
      ...updated,
      prices: updated.prices.map((p) => ({ ...p, price: Number(p.price) })),
    };
  }

  async remove(id: number) {
    await this.findOne(id);
    const active = await this.prisma.subscription.count({
      where: {
        recurringPlanId: id,
        state: { in: ['CONFIRMED', 'PAUSED'] },
      },
    });
    if (active > 0) {
      throw new BadRequestException(
        `Cannot delete plan: ${active} active subscription(s) linked`,
      );
    }
    await this.prisma.recurringPlan.delete({ where: { id } });
    return { success: true };
  }
}
