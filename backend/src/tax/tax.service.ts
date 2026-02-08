import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTaxDto } from './dto/create-tax.dto';
import { UpdateTaxDto } from './dto/update-tax.dto';

@Injectable()
export class TaxService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTaxDto) {
    const created = await this.prisma.tax.create({
      data: {
        name: dto.name,
        percent: new Prisma.Decimal(dto.percent),
        isActive: dto.isActive ?? true,
      },
    });
    return { ...created, percent: Number(created.percent) };
  }

  async findAll(params?: { skip?: number; take?: number; q?: string; isActive?: boolean }) {
    const { skip, take, q, isActive } = params ?? {};

    const where: Prisma.TaxWhereInput = {
      ...(q
        ? {
            OR: [{ name: { contains: q, mode: 'insensitive' } }],
          }
        : {}),
      ...(isActive !== undefined ? { isActive } : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.tax.findMany({
        where,
        skip,
        take: take ?? 50,
        orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
      }),
      this.prisma.tax.count({ where }),
    ]);

    return {
      data: data.map((t) => ({ ...t, percent: Number(t.percent) })),
      total,
    };
  }

  async findOne(id: number) {
    const tax = await this.prisma.tax.findUnique({ where: { id } });
    if (!tax) throw new NotFoundException('Tax not found');
    return { ...tax, percent: Number(tax.percent) };
  }

  async update(id: number, dto: UpdateTaxDto) {
    await this.findOne(id);

    const updated = await this.prisma.tax.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.percent !== undefined && { percent: new Prisma.Decimal(dto.percent) }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });

    return { ...updated, percent: Number(updated.percent) };
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.tax.delete({ where: { id } });
    return { success: true };
  }
}
