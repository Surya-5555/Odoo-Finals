import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateQuotationTemplateDto } from './dto/create-quotation-template.dto';
import { UpdateQuotationTemplateDto } from './dto/update-quotation-template.dto';

@Injectable()
export class QuotationTemplateService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateQuotationTemplateDto) {
    return this.prisma.quotationTemplate.create({
      data: {
        name: dto.name,
        content: dto.content,
      },
    });
  }

  async findAll(params?: { skip?: number; take?: number }) {
    const { skip, take } = params ?? {};
    const [data, total] = await Promise.all([
      this.prisma.quotationTemplate.findMany({
        skip,
        take: take ?? 50,
        orderBy: { name: 'asc' },
      }),
      this.prisma.quotationTemplate.count(),
    ]);
    return { data, total };
  }

  async findOne(id: number) {
    const template = await this.prisma.quotationTemplate.findUnique({
      where: { id },
    });
    if (!template) throw new NotFoundException('Quotation template not found');
    return template;
  }

  async update(id: number, dto: UpdateQuotationTemplateDto) {
    await this.findOne(id);
    return this.prisma.quotationTemplate.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.content !== undefined && { content: dto.content }),
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.quotationTemplate.delete({ where: { id } });
    return { success: true };
  }
}
