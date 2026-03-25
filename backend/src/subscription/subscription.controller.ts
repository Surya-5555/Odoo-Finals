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
<<<<<<< HEAD
  UseGuards,
=======
  ForbiddenException,
>>>>>>> 34d8f0563272fc3ffddc6ac63922119f2dfd0da5
} from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { UpsellSubscriptionDto } from './dto/upsell-subscription.dto';
import { SubscriptionState } from '@prisma/client';
<<<<<<< HEAD
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guard/roles.guard';
import type { Request } from 'express';

type RequestWithUser = Request & { user?: { id: number; role: string } };
=======
import { PrismaService } from '../../prisma/prisma.service';
import type { Request } from 'express';
>>>>>>> 34d8f0563272fc3ffddc6ac63922119f2dfd0da5

@Controller('subscriptions')
export class SubscriptionController {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly prisma: PrismaService,
  ) {}

  private getUser(req: Request) {
    return (req as any).user as { id: number; role?: string } | undefined;
  }

  private async getPortalContactIdOrThrow(userId: number) {
    const contact = await this.prisma.contact.findFirst({
      where: { userId },
      select: { id: true },
    });
    if (!contact) throw new ForbiddenException('Contact not linked');
    return contact.id;
  }

  private async assertPortalOwnsSubscription(userId: number, subscriptionId: number) {
    const portalContactId = await this.getPortalContactIdOrThrow(userId);
    const sub = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
      select: { id: true, contactId: true },
    });
    if (!sub || sub.contactId !== portalContactId) {
      throw new ForbiddenException('Insufficient permissions');
    }
  }

  @Post()
<<<<<<< HEAD
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'INTERNAL')
  create(@Body() createSubscriptionDto: CreateSubscriptionDto) {
=======
  async create(@Req() req: Request, @Body() createSubscriptionDto: CreateSubscriptionDto) {
    const user = this.getUser(req);
    if (user?.role === 'PORTAL') {
      const contactId = await this.getPortalContactIdOrThrow(user.id);
      return this.subscriptionService.create({
        ...createSubscriptionDto,
        contactId,
      });
    }
>>>>>>> 34d8f0563272fc3ffddc6ac63922119f2dfd0da5
    return this.subscriptionService.create(createSubscriptionDto);
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
    @Query('contactId') contactId?: string,
    @Query('state') state?: SubscriptionState,
  ) {
    const user = this.getUser(req);
    if (user?.role === 'PORTAL') {
      // Force portal users to only see their own orders.
      return this.getPortalContactIdOrThrow(user.id).then((portalContactId) =>
        this.subscriptionService.findAll({
          skip: skip ? parseInt(skip, 10) : undefined,
          take: take ? parseInt(take, 10) : undefined,
          contactId: portalContactId,
          state,
        }),
      );
    }
    return this.subscriptionService.findAll({
      skip: skip ? parseInt(skip, 10) : undefined,
      take: take ? parseInt(take, 10) : undefined,
      contactId: contactId ? parseInt(contactId, 10) : undefined,
      state,
      requestingUser: req.user,
    });
  }

  @Get('by-number/:number')
  findByNumber(@Req() req: RequestWithUser, @Param('number') number: string) {
    return this.subscriptionService.findByNumber(number, req.user);
  }

  @Get(':id')
<<<<<<< HEAD
  findOne(@Req() req: RequestWithUser, @Param('id', ParseIntPipe) id: number) {
    return this.subscriptionService.findOneScoped(id, req.user);
=======
  async findOne(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    const user = this.getUser(req);
    if (user?.role === 'PORTAL') {
      await this.assertPortalOwnsSubscription(user.id, id);
    }
    const sub = await this.subscriptionService.findOne(id);
    return sub;
>>>>>>> 34d8f0563272fc3ffddc6ac63922119f2dfd0da5
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'INTERNAL')
  update(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
  ) {
    const user = this.getUser(req);
    if (user?.role === 'PORTAL') {
      return this.assertPortalOwnsSubscription(user.id, id).then(() =>
        this.subscriptionService.update(id, updateSubscriptionDto),
      );
    }
    return this.subscriptionService.update(id, updateSubscriptionDto);
  }

  @Post(':id/send')
<<<<<<< HEAD
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'INTERNAL')
  send(@Param('id', ParseIntPipe) id: number) {
=======
  async send(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    const user = this.getUser(req);
    if (user?.role === 'PORTAL') await this.assertPortalOwnsSubscription(user.id, id);
>>>>>>> 34d8f0563272fc3ffddc6ac63922119f2dfd0da5
    return this.subscriptionService.send(id);
  }

  @Post(':id/confirm')
<<<<<<< HEAD
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'INTERNAL')
  confirm(@Param('id', ParseIntPipe) id: number) {
=======
  async confirm(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    const user = this.getUser(req);
    if (user?.role === 'PORTAL') await this.assertPortalOwnsSubscription(user.id, id);
>>>>>>> 34d8f0563272fc3ffddc6ac63922119f2dfd0da5
    return this.subscriptionService.confirm(id);
  }

  @Post(':id/renew')
<<<<<<< HEAD
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'INTERNAL')
  renew(@Param('id', ParseIntPipe) id: number) {
=======
  async renew(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    const user = this.getUser(req);
    if (user?.role === 'PORTAL') await this.assertPortalOwnsSubscription(user.id, id);
>>>>>>> 34d8f0563272fc3ffddc6ac63922119f2dfd0da5
    return this.subscriptionService.renew(id);
  }

  @Post(':id/close')
<<<<<<< HEAD
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'INTERNAL')
  close(@Param('id', ParseIntPipe) id: number) {
=======
  async close(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    const user = this.getUser(req);
    if (user?.role === 'PORTAL') await this.assertPortalOwnsSubscription(user.id, id);
>>>>>>> 34d8f0563272fc3ffddc6ac63922119f2dfd0da5
    return this.subscriptionService.close(id);
  }

  @Post(':id/pause')
<<<<<<< HEAD
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'INTERNAL')
  pause(@Param('id', ParseIntPipe) id: number) {
=======
  async pause(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    const user = this.getUser(req);
    if (user?.role === 'PORTAL') await this.assertPortalOwnsSubscription(user.id, id);
>>>>>>> 34d8f0563272fc3ffddc6ac63922119f2dfd0da5
    return this.subscriptionService.pause(id);
  }

  @Post(':id/resume')
<<<<<<< HEAD
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'INTERNAL')
  resume(@Param('id', ParseIntPipe) id: number) {
=======
  async resume(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    const user = this.getUser(req);
    if (user?.role === 'PORTAL') await this.assertPortalOwnsSubscription(user.id, id);
>>>>>>> 34d8f0563272fc3ffddc6ac63922119f2dfd0da5
    return this.subscriptionService.resume(id);
  }

  @Post(':id/invoices')
<<<<<<< HEAD
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'INTERNAL')
  createInvoice(@Param('id', ParseIntPipe) id: number) {
=======
  async createInvoice(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    const user = this.getUser(req);
    if (user?.role === 'PORTAL') await this.assertPortalOwnsSubscription(user.id, id);
>>>>>>> 34d8f0563272fc3ffddc6ac63922119f2dfd0da5
    return this.subscriptionService.createInvoice(id);
  }

  @Post(':id/upsell')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'INTERNAL')
  upsell(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() upsellSubscriptionDto: UpsellSubscriptionDto,
  ) {
    const user = this.getUser(req);
    if (user?.role === 'PORTAL') {
      return this.assertPortalOwnsSubscription(user.id, id).then(() =>
        this.subscriptionService.upsell(id, upsellSubscriptionDto),
      );
    }
    return this.subscriptionService.upsell(id, upsellSubscriptionDto);
  }

  @Delete(':id')
<<<<<<< HEAD
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'INTERNAL')
  remove(@Param('id', ParseIntPipe) id: number) {
=======
  async remove(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    const user = this.getUser(req);
    if (user?.role === 'PORTAL') await this.assertPortalOwnsSubscription(user.id, id);
>>>>>>> 34d8f0563272fc3ffddc6ac63922119f2dfd0da5
    return this.subscriptionService.remove(id);
  }
}
