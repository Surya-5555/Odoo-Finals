<<<<<<< HEAD
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DiscountType, Prisma } from '@prisma/client';
=======
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
>>>>>>> 34d8f0563272fc3ffddc6ac63922119f2dfd0da5
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';

<<<<<<< HEAD
type DiscountWithProduct = Prisma.DiscountGetPayload<{
  include: { product: true };
}>;

type SerializedDiscount = Omit<
  DiscountWithProduct,
  'percent' | 'fixed' | 'minPurchase' | 'minQuantity'
> & {
  percent: number | null;
  fixed: number | null;
  minPurchase: number | null;
  minQuantity: number | null;
};
=======
function now() {
  return new Date();
}
>>>>>>> 34d8f0563272fc3ffddc6ac63922119f2dfd0da5

@Injectable()
export class DiscountService {
  constructor(private readonly prisma: PrismaService) {}

<<<<<<< HEAD
  private serializeDiscount(discount: DiscountWithProduct): SerializedDiscount {
    return {
      ...discount,
      percent: discount.percent != null ? Number(discount.percent) : null,
      fixed: discount.fixed != null ? Number(discount.fixed) : null,
      minPurchase:
        discount.minPurchase != null ? Number(discount.minPurchase) : null,
      minQuantity:
        discount.minQuantity != null ? Number(discount.minQuantity) : null,
    };
  }

  private validateDto(dto: {
    type?: DiscountType;
    percent?: number;
    fixed?: number;
  }) {
    if (dto.type === 'PERCENTAGE') {
      if (dto.percent == null) {
        throw new BadRequestException(
          'percent is required for percentage discounts',
        );
      }
    }
    if (dto.type === 'FIXED') {
      if (dto.fixed == null) {
        throw new BadRequestException('fixed is required for fixed discounts');
      }
    }
  }

  async create(dto: CreateDiscountDto) {
    this.validateDto(dto);

    if (
      dto.endDate &&
      dto.startDate &&
      new Date(dto.endDate) < new Date(dto.startDate)
    ) {
      throw new BadRequestException('endDate must be after startDate');
    }

    const discount = await this.prisma.discount.create({
      data: {
        name: dto.name,
        type: dto.type,
        percent:
          dto.percent != null ? new Prisma.Decimal(dto.percent) : undefined,
        fixed: dto.fixed != null ? new Prisma.Decimal(dto.fixed) : undefined,
        minPurchase:
          dto.minPurchase != null
            ? new Prisma.Decimal(dto.minPurchase)
            : undefined,
        minQuantity:
          dto.minQuantity != null
            ? new Prisma.Decimal(dto.minQuantity)
            : undefined,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        limitUsage: dto.limitUsage,
        appliesTo: dto.appliesTo,
        productId: dto.productId,
        active: dto.active ?? true,
      },
      include: { product: true },
    });

    return this.serializeDiscount(discount as DiscountWithProduct);
  }

  async findAll(params?: { skip?: number; take?: number; active?: boolean }) {
    const { skip, take, active } = params ?? {};
    const where: Prisma.DiscountWhereInput = {};
    if (active != null) where.active = active;

    const [data, total] = await Promise.all([
      this.prisma.discount.findMany({
        skip,
        take: take ?? 50,
        where,
        include: { product: true },
        orderBy: { createdAt: 'desc' },
=======
  private serialize(d: any) {
    return {
      ...d,
      percent: Number(d.percent),
      limitUsage: Boolean(d.limitUsage),
      usageLimit: d.usageLimit ?? null,
      timesUsed: d.timesUsed ?? 0,
      productId: d.productId ?? null,
    };
  }

  async create(dto: CreateDiscountDto) {
    const limitUsage = dto.limitUsage ?? false;
    if (limitUsage && (!dto.usageLimit || dto.usageLimit < 1)) {
      throw new BadRequestException('usageLimit must be >= 1 when limitUsage is enabled');
    }

    const created = await this.prisma.discount.create({
      data: {
        code: dto.code.trim().toUpperCase(),
        percent: new Prisma.Decimal(dto.percent),
        isActive: dto.isActive ?? true,
        startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
        endsAt: dto.endsAt ? new Date(dto.endsAt) : undefined,
        limitUsage,
        usageLimit: limitUsage ? dto.usageLimit : null,
        productId: dto.productId ?? undefined,
      },
    });
    return this.serialize(created);
  }

  async findAll(params?: { skip?: number; take?: number; q?: string; isActive?: boolean }) {
    const { skip, take, q, isActive } = params ?? {};

    const where: Prisma.DiscountWhereInput = {
      ...(q
        ? {
            OR: [
              { code: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(isActive !== undefined ? { isActive } : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.discount.findMany({
        where,
        skip,
        take: take ?? 50,
        orderBy: [{ isActive: 'desc' }, { code: 'asc' }],
>>>>>>> 34d8f0563272fc3ffddc6ac63922119f2dfd0da5
      }),
      this.prisma.discount.count({ where }),
    ]);

<<<<<<< HEAD
    return {
      data: (data as DiscountWithProduct[]).map((d) =>
        this.serializeDiscount(d),
      ),
      total,
    };
  }

  async findOne(id: number) {
    const discount = await this.prisma.discount.findUnique({
      where: { id },
      include: { product: true },
    });
    if (!discount) throw new NotFoundException('Discount not found');
    return this.serializeDiscount(discount as DiscountWithProduct);
=======
    return { data: data.map((d) => this.serialize(d)), total };
  }

  async findOne(id: number) {
    const d = await this.prisma.discount.findUnique({ where: { id } });
    if (!d) throw new NotFoundException('Discount not found');
    return this.serialize(d);
  }

  async validate(code: string, params?: { productId?: number }) {
    const normalized = code.trim().toUpperCase();
    if (!normalized) throw new BadRequestException('Discount code required');

    const d = await this.prisma.discount.findUnique({ where: { code: normalized } });
    if (!d || !d.isActive) throw new NotFoundException('Invalid discount code');

    const t = now();
    if (d.startsAt && t < d.startsAt) throw new BadRequestException('Discount not active yet');
    if (d.endsAt && t > d.endsAt) throw new BadRequestException('Discount expired');

    if (d.limitUsage) {
      if (!d.usageLimit || d.usageLimit < 1) {
        throw new BadRequestException('Discount misconfigured: usageLimit missing');
      }
      if (d.timesUsed >= d.usageLimit) {
        throw new BadRequestException('Discount usage limit reached');
      }
    }

    if (d.productId != null && params?.productId != null && d.productId !== params.productId) {
      throw new BadRequestException('Discount not applicable to this product');
    }

    return { code: d.code, percent: Number(d.percent) };
>>>>>>> 34d8f0563272fc3ffddc6ac63922119f2dfd0da5
  }

  async update(id: number, dto: UpdateDiscountDto) {
    await this.findOne(id);

<<<<<<< HEAD
    if (dto.type) {
      this.validateDto({
        type: dto.type,
        percent: dto.percent,
        fixed: dto.fixed,
      });
    }

    if (
      dto.endDate &&
      dto.startDate &&
      new Date(dto.endDate) < new Date(dto.startDate)
    ) {
      throw new BadRequestException('endDate must be after startDate');
=======
    const limitUsage = dto.limitUsage;
    if (limitUsage === true && (!dto.usageLimit || dto.usageLimit < 1)) {
      throw new BadRequestException('usageLimit must be >= 1 when limitUsage is enabled');
>>>>>>> 34d8f0563272fc3ffddc6ac63922119f2dfd0da5
    }

    const updated = await this.prisma.discount.update({
      where: { id },
      data: {
<<<<<<< HEAD
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.type !== undefined && { type: dto.type }),
        ...(dto.percent !== undefined && {
          percent: dto.percent != null ? new Prisma.Decimal(dto.percent) : null,
        }),
        ...(dto.fixed !== undefined && {
          fixed: dto.fixed != null ? new Prisma.Decimal(dto.fixed) : null,
        }),
        ...(dto.minPurchase !== undefined && {
          minPurchase:
            dto.minPurchase != null
              ? new Prisma.Decimal(dto.minPurchase)
              : null,
        }),
        ...(dto.minQuantity !== undefined && {
          minQuantity:
            dto.minQuantity != null
              ? new Prisma.Decimal(dto.minQuantity)
              : null,
        }),
        ...(dto.startDate !== undefined && {
          startDate: dto.startDate ? new Date(dto.startDate) : null,
        }),
        ...(dto.endDate !== undefined && {
          endDate: dto.endDate ? new Date(dto.endDate) : null,
        }),
        ...(dto.limitUsage !== undefined && { limitUsage: dto.limitUsage }),
        ...(dto.appliesTo !== undefined && { appliesTo: dto.appliesTo }),
        ...(dto.productId !== undefined && { productId: dto.productId }),
        ...(dto.active !== undefined && { active: dto.active }),
      },
      include: { product: true },
    });

    return this.serializeDiscount(updated as DiscountWithProduct);
=======
        ...(dto.code !== undefined && { code: dto.code.trim().toUpperCase() }),
        ...(dto.percent !== undefined && { percent: new Prisma.Decimal(dto.percent) }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(dto.startsAt !== undefined && { startsAt: dto.startsAt ? new Date(dto.startsAt) : null }),
        ...(dto.endsAt !== undefined && { endsAt: dto.endsAt ? new Date(dto.endsAt) : null }),
        ...(dto.limitUsage !== undefined && {
          limitUsage: dto.limitUsage,
          usageLimit: dto.limitUsage ? (dto.usageLimit ?? undefined) : null,
        }),
        ...(dto.limitUsage === undefined && dto.usageLimit !== undefined && { usageLimit: dto.usageLimit }),
        ...(dto.productId !== undefined && { productId: dto.productId }),
      },
    });

    return this.serialize(updated);
>>>>>>> 34d8f0563272fc3ffddc6ac63922119f2dfd0da5
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.discount.delete({ where: { id } });
    return { success: true };
  }
}
