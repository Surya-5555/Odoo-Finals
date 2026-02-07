import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ContactService {
  constructor(private readonly prisma: PrismaService) {}

  private isPortal(user?: { id: number; role: string }) {
    return user?.role === 'PORTAL';
  }

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
    requestingUser?: { id: number; role: string };
  }) {
    const { skip, take, where, requestingUser } = params ?? {};
    const scopedWhere: Prisma.ContactWhereInput = { ...(where ?? {}) };
    if (requestingUser?.role === 'PORTAL') {
      scopedWhere.userId = requestingUser.id;
    }
    const [data, total] = await Promise.all([
      this.prisma.contact.findMany({
        skip,
        take: take ?? 50,
        where: scopedWhere,
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
      this.prisma.contact.count({ where: scopedWhere }),
    ]);
    return {
      data: data.map((c) => ({
        ...c,
        activeSubscriptionsCount: c._count.subscriptions,
      })),
      total,
    };
  }

  async findOne(id: number, requestingUser?: { id: number; role: string }) {
    const contact = await this.prisma.contact.findFirst({
      where: {
        id,
        ...(requestingUser?.role === 'PORTAL'
          ? { userId: requestingUser.id }
          : {}),
      },
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
