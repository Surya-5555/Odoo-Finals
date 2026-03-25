<<<<<<< HEAD
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Tax } from '@prisma/client';
=======
import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
>>>>>>> 34d8f0563272fc3ffddc6ac63922119f2dfd0da5
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTaxDto } from './dto/create-tax.dto';
import { UpdateTaxDto } from './dto/update-tax.dto';

<<<<<<< HEAD
type SerializedTax = Omit<Tax, 'percentage'> & { percentage: number };

=======
>>>>>>> 34d8f0563272fc3ffddc6ac63922119f2dfd0da5
@Injectable()
export class TaxService {
  constructor(private readonly prisma: PrismaService) {}

<<<<<<< HEAD
  private serializeTax(tax: Tax): SerializedTax {
    return {
      ...tax,
      percentage: tax.percentage != null ? Number(tax.percentage) : 0,
    };
  }

  async create(dto: CreateTaxDto) {
    if (
      dto.endDate &&
      dto.startDate &&
      new Date(dto.endDate) < new Date(dto.startDate)
    ) {
      throw new BadRequestException('endDate must be after startDate');
    }

    const tax = await this.prisma.tax.create({
      data: {
        name: dto.name,
        percentage: new Prisma.Decimal(dto.percentage),
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        active: dto.active ?? true,
      },
    });

    return this.serializeTax(tax);
  }

  async findAll(params?: { skip?: number; take?: number; active?: boolean }) {
    const { skip, take, active } = params ?? {};
    const where: Prisma.TaxWhereInput = {};
    if (active != null) where.active = active;

    const [data, total] = await Promise.all([
      this.prisma.tax.findMany({
        skip,
        take: take ?? 50,
        where,
        orderBy: { createdAt: 'desc' },
=======
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
>>>>>>> 34d8f0563272fc3ffddc6ac63922119f2dfd0da5
      }),
      this.prisma.tax.count({ where }),
    ]);

<<<<<<< HEAD
    return { data: data.map((t) => this.serializeTax(t)), total };
=======
    return {
      data: data.map((t) => ({ ...t, percent: Number(t.percent) })),
      total,
    };
>>>>>>> 34d8f0563272fc3ffddc6ac63922119f2dfd0da5
  }

  async findOne(id: number) {
    const tax = await this.prisma.tax.findUnique({ where: { id } });
    if (!tax) throw new NotFoundException('Tax not found');
<<<<<<< HEAD
    return this.serializeTax(tax);
=======
    return { ...tax, percent: Number(tax.percent) };
>>>>>>> 34d8f0563272fc3ffddc6ac63922119f2dfd0da5
  }

  async update(id: number, dto: UpdateTaxDto) {
    await this.findOne(id);
<<<<<<< HEAD
    if (
      dto.endDate &&
      dto.startDate &&
      new Date(dto.endDate) < new Date(dto.startDate)
    ) {
      throw new BadRequestException('endDate must be after startDate');
    }
=======
>>>>>>> 34d8f0563272fc3ffddc6ac63922119f2dfd0da5

    const updated = await this.prisma.tax.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
<<<<<<< HEAD
        ...(dto.percentage !== undefined && {
          percentage: new Prisma.Decimal(dto.percentage),
        }),
        ...(dto.startDate !== undefined && {
          startDate: dto.startDate ? new Date(dto.startDate) : null,
        }),
        ...(dto.endDate !== undefined && {
          endDate: dto.endDate ? new Date(dto.endDate) : null,
        }),
        ...(dto.active !== undefined && { active: dto.active }),
      },
    });

    return this.serializeTax(updated);
=======
        ...(dto.percent !== undefined && { percent: new Prisma.Decimal(dto.percent) }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });

    return { ...updated, percent: Number(updated.percent) };
>>>>>>> 34d8f0563272fc3ffddc6ac63922119f2dfd0da5
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.tax.delete({ where: { id } });
    return { success: true };
  }
}
