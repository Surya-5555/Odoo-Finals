import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DiscountType, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';

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

@Injectable()
export class DiscountService {
  constructor(private readonly prisma: PrismaService) {}

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
      }),
      this.prisma.discount.count({ where }),
    ]);

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
  }

  async update(id: number, dto: UpdateDiscountDto) {
    await this.findOne(id);

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
    }

    const updated = await this.prisma.discount.update({
      where: { id },
      data: {
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
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.discount.delete({ where: { id } });
    return { success: true };
  }
}
