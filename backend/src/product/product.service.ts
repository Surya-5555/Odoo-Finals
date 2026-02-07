import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProductDto) {
    return this.prisma.product.create({
      data: {
        name: dto.name,
        productType: dto.productType,
        salesPrice: new Prisma.Decimal(dto.salesPrice),
        costPrice: dto.costPrice != null ? new Prisma.Decimal(dto.costPrice) : undefined,
        description: dto.description,
      },
    });
  }

  async findAll(params?: {
    skip?: number;
    take?: number;
    where?: Prisma.ProductWhereInput;
  }) {
    const { skip, take, where } = params ?? {};
    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        skip,
        take: take ?? 50,
        where,
        orderBy: { name: 'asc' },
      }),
      this.prisma.product.count({ where }),
    ]);
    return {
      data: items.map((p) => ({
        ...p,
        salesPrice: Number(p.salesPrice),
        costPrice: p.costPrice != null ? Number(p.costPrice) : null,
      })),
      total,
    };
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });
    if (!product) throw new NotFoundException('Product not found');
    return {
      ...product,
      salesPrice: Number(product.salesPrice),
      costPrice: product.costPrice != null ? Number(product.costPrice) : null,
    };
  }

  async update(id: number, dto: UpdateProductDto) {
    await this.findOne(id);
    const updated = await this.prisma.product.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.productType !== undefined && { productType: dto.productType }),
        ...(dto.salesPrice !== undefined && {
          salesPrice: new Prisma.Decimal(dto.salesPrice),
        }),
        ...(dto.costPrice !== undefined && {
          costPrice: new Prisma.Decimal(dto.costPrice),
        }),
        ...(dto.description !== undefined && { description: dto.description }),
      },
    });
    return {
      ...updated,
      salesPrice: Number(updated.salesPrice),
      costPrice: updated.costPrice != null ? Number(updated.costPrice) : null,
    };
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.product.delete({ where: { id } });
    return { success: true };
  }
}
