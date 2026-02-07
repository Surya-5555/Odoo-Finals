import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ContactService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateContactDto) {
    return this.prisma.contact.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        address: dto.address,
        companyName: dto.companyName,
        userId: dto.userId,
      },
    });
  }

  async findAll(params?: {
    skip?: number;
    take?: number;
    where?: Prisma.ContactWhereInput;
  }) {
    const { skip, take, where } = params ?? {};
    const [data, total] = await Promise.all([
      this.prisma.contact.findMany({
        skip,
        take: take ?? 50,
        where,
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: {
              subscriptions: {
                where: { state: { in: ['CONFIRMED', 'PAUSED'] } },
              },
            },
          },
        },
      }),
      this.prisma.contact.count({ where }),
    ]);
    return {
      data: data.map((c) => ({
        ...c,
        activeSubscriptionsCount: c._count.subscriptions,
      })),
      total,
    };
  }

  async findOne(id: number) {
    const contact = await this.prisma.contact.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            subscriptions: {
              where: { state: { in: ['CONFIRMED', 'PAUSED'] } },
            },
          },
        },
      },
    });
    if (!contact) throw new NotFoundException('Contact not found');
    return {
      ...contact,
      activeSubscriptionsCount: contact._count.subscriptions,
    };
  }

  async update(id: number, dto: UpdateContactDto) {
    await this.findOne(id);
    return this.prisma.contact.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.email !== undefined && { email: dto.email }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.address !== undefined && { address: dto.address }),
        ...(dto.companyName !== undefined && { companyName: dto.companyName }),
        ...(dto.userId !== undefined && { userId: dto.userId }),
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.contact.delete({ where: { id } });
    return { success: true };
  }
}
