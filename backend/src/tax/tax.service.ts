import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Tax } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTaxDto } from './dto/create-tax.dto';
import { UpdateTaxDto } from './dto/update-tax.dto';

type SerializedTax = Omit<Tax, 'percentage'> & { percentage: number };

@Injectable()
export class TaxService {
  constructor(private readonly prisma: PrismaService) {}

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
      }),
      this.prisma.tax.count({ where }),
    ]);

    return { data: data.map((t) => this.serializeTax(t)), total };
  }

  async findOne(id: number) {
    const tax = await this.prisma.tax.findUnique({ where: { id } });
    if (!tax) throw new NotFoundException('Tax not found');
    return this.serializeTax(tax);
  }

  async update(id: number, dto: UpdateTaxDto) {
    await this.findOne(id);
    if (
      dto.endDate &&
      dto.startDate &&
      new Date(dto.endDate) < new Date(dto.startDate)
    ) {
      throw new BadRequestException('endDate must be after startDate');
    }

    const updated = await this.prisma.tax.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
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
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.tax.delete({ where: { id } });
    return { success: true };
  }
}
