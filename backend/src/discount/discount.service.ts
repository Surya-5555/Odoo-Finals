import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';

function now() {
  return new Date();
}

@Injectable()
export class DiscountService {
  constructor(private readonly prisma: PrismaService) {}

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
      }),
      this.prisma.discount.count({ where }),
    ]);

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
  }

  async update(id: number, dto: UpdateDiscountDto) {
    await this.findOne(id);

    const limitUsage = dto.limitUsage;
    if (limitUsage === true && (!dto.usageLimit || dto.usageLimit < 1)) {
      throw new BadRequestException('usageLimit must be >= 1 when limitUsage is enabled');
    }

    const updated = await this.prisma.discount.update({
      where: { id },
      data: {
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
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.discount.delete({ where: { id } });
    return { success: true };
  }
}
