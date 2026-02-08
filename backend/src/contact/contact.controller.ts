import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { PrismaService } from '../../prisma/prisma.service';
import type { Request } from 'express';

@Controller('contacts')
export class ContactController {
  constructor(
    private readonly contactService: ContactService,
    private readonly prisma: PrismaService,
  ) {}

  private isPortal(req: Request) {
    const user = (req as any).user as { role?: string } | undefined;
    return user?.role === 'PORTAL';
  }

  private requirePortalUser(req: Request) {
    const user = (req as any).user as { id: number; email?: string; role?: string } | undefined;
    if (!user?.id) throw new ForbiddenException('Insufficient permissions');
    return user;
  }

  @Post()
  create(@Req() req: Request, @Body() createContactDto: CreateContactDto) {
    if (this.isPortal(req)) {
      const user = this.requirePortalUser(req);
      // PORTAL users can only create their own linked contact.
      return this.contactService.create({
        ...createContactDto,
        userId: user.id,
        email: user.email ?? createContactDto.email,
      });
    }
    return this.contactService.create(createContactDto);
  }

  @Get()
  findAll(
    @Req() req: Request,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('email') email?: string,
    @Query('userId') userId?: string,
  ) {
    if (this.isPortal(req)) {
      const user = this.requirePortalUser(req);
      return this.contactService.findAll({
        skip: skip ? parseInt(skip, 10) : undefined,
        take: take ? parseInt(take, 10) : undefined,
        where: { userId: user.id },
      });
    }
    return this.contactService.findAll({
      skip: skip ? parseInt(skip, 10) : undefined,
      take: take ? parseInt(take, 10) : undefined,
      where: {
        ...(email ? { email } : {}),
        ...(userId ? { userId: parseInt(userId, 10) } : {}),
      },
    });
  }

  @Get(':id')
  async findOne(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    if (this.isPortal(req)) {
      const user = this.requirePortalUser(req);
      const c = await this.prisma.contact.findUnique({
        where: { id },
        select: { id: true, userId: true },
      });
      if (!c || c.userId !== user.id) throw new ForbiddenException('Insufficient permissions');
    }
    return this.contactService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateContactDto: UpdateContactDto,
  ) {
    if (this.isPortal(req)) {
      const user = this.requirePortalUser(req);
      const c = await this.prisma.contact.findUnique({
        where: { id },
        select: { id: true, userId: true },
      });
      if (!c || c.userId !== user.id) throw new ForbiddenException('Insufficient permissions');
      // PORTAL users can never re-link to another user.
      delete (updateContactDto as any).userId;
    }
    return this.contactService.update(id, updateContactDto);
  }

  @Delete(':id')
  async remove(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    if (this.isPortal(req)) {
      const user = this.requirePortalUser(req);
      const c = await this.prisma.contact.findUnique({
        where: { id },
        select: { id: true, userId: true },
      });
      if (!c || c.userId !== user.id) throw new ForbiddenException('Insufficient permissions');
    }
    return this.contactService.remove(id);
  }
}
