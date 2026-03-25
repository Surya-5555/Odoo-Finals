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
<<<<<<< HEAD
  UseGuards,
  Req,
=======
  Req,
  ForbiddenException,
>>>>>>> 34d8f0563272fc3ffddc6ac63922119f2dfd0da5
} from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
<<<<<<< HEAD
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guard/roles.guard';
import type { Request } from 'express';

type RequestWithUser = Request & { user?: { id: number; role: string } };
=======
import { PrismaService } from '../../prisma/prisma.service';
import type { Request } from 'express';
>>>>>>> 34d8f0563272fc3ffddc6ac63922119f2dfd0da5

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

  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'INTERNAL')
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
<<<<<<< HEAD
    @Req() req: RequestWithUser,
=======
    @Req() req: Request,
>>>>>>> 34d8f0563272fc3ffddc6ac63922119f2dfd0da5
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
<<<<<<< HEAD
      requestingUser: req.user,
=======
      where: {
        ...(email ? { email } : {}),
        ...(userId ? { userId: parseInt(userId, 10) } : {}),
      },
>>>>>>> 34d8f0563272fc3ffddc6ac63922119f2dfd0da5
    });
  }

  @Get(':id')
<<<<<<< HEAD
  findOne(@Req() req: RequestWithUser, @Param('id', ParseIntPipe) id: number) {
    return this.contactService.findOne(id, req.user);
=======
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
>>>>>>> 34d8f0563272fc3ffddc6ac63922119f2dfd0da5
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'INTERNAL')
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

  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'INTERNAL')
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
