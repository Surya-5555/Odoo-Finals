import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePaymentTermDto } from './dto/create-payment-term.dto';
import { UpdatePaymentTermDto } from './dto/update-payment-term.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class PaymentTermService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePaymentTermDto) {
    return this.prisma.paymentTerm.create({
      data: {
        name: dto.name,
        dueAfterDays: dto.dueAfterDays,
        earlyDiscountPercent: dto.earlyDiscountPercent
          ? new Prisma.Decimal(dto.earlyDiscountPercent)
          : undefined,
        earlyDiscountFixed: dto.earlyDiscountFixed
          ? new Prisma.Decimal(dto.earlyDiscountFixed)
          : undefined,
        earlyDiscountDays: dto.earlyDiscountDays,
      },
    });
  }

  async findAll(params?: { skip?: number; take?: number }) {
    const { skip, take } = params ?? {};
    const [data, total] = await Promise.all([
      this.prisma.paymentTerm.findMany({
        skip,
        take: take ?? 50,
        orderBy: { name: 'asc' },
      }),
      this.prisma.paymentTerm.count(),
    ]);
    return {
      data: data.map((p) => ({
        ...p,
        earlyDiscountPercent:
          p.earlyDiscountPercent != null
            ? Number(p.earlyDiscountPercent)
            : null,
        earlyDiscountFixed:
          p.earlyDiscountFixed != null ? Number(p.earlyDiscountFixed) : null,
      })),
      total,
    };
  }

  async findOne(id: number) {
    const term = await this.prisma.paymentTerm.findUnique({
      where: { id },
    });
    if (!term) throw new NotFoundException('Payment term not found');
    return {
      ...term,
      earlyDiscountPercent:
        term.earlyDiscountPercent != null
          ? Number(term.earlyDiscountPercent)
          : null,
      earlyDiscountFixed:
        term.earlyDiscountFixed != null
          ? Number(term.earlyDiscountFixed)
          : null,
    };
  }

  async update(id: number, dto: UpdatePaymentTermDto) {
    await this.findOne(id);
    const updated = await this.prisma.paymentTerm.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.dueAfterDays !== undefined && {
          dueAfterDays: dto.dueAfterDays,
        }),
        ...(dto.earlyDiscountPercent !== undefined && {
          earlyDiscountPercent: new Prisma.Decimal(dto.earlyDiscountPercent),
        }),
        ...(dto.earlyDiscountFixed !== undefined && {
          earlyDiscountFixed: new Prisma.Decimal(dto.earlyDiscountFixed),
        }),
        ...(dto.earlyDiscountDays !== undefined && {
          earlyDiscountDays: dto.earlyDiscountDays,
        }),
      },
    });
    return {
      ...updated,
      earlyDiscountPercent:
        updated.earlyDiscountPercent != null
          ? Number(updated.earlyDiscountPercent)
          : null,
      earlyDiscountFixed:
        updated.earlyDiscountFixed != null
          ? Number(updated.earlyDiscountFixed)
          : null,
    };
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.paymentTerm.delete({ where: { id } });
    return { success: true };
  }
}
