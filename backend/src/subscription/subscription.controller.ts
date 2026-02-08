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
import { SubscriptionService } from './subscription.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { UpsellSubscriptionDto } from './dto/upsell-subscription.dto';
import { SubscriptionState } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import type { Request } from 'express';

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
  async create(@Req() req: Request, @Body() createSubscriptionDto: CreateSubscriptionDto) {
    const user = this.getUser(req);
    if (user?.role === 'PORTAL') {
      const contactId = await this.getPortalContactIdOrThrow(user.id);
      return this.subscriptionService.create({
        ...createSubscriptionDto,
        contactId,
      });
    }
    return this.subscriptionService.create(createSubscriptionDto);
  }

  @Get()
  findAll(
    @Req() req: Request,
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
    });
  }

  @Get('by-number/:number')
  findByNumber(@Param('number') number: string) {
    return this.subscriptionService.findByNumber(number);
  }

  @Get(':id')
  async findOne(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    const user = this.getUser(req);
    if (user?.role === 'PORTAL') {
      await this.assertPortalOwnsSubscription(user.id, id);
    }
    const sub = await this.subscriptionService.findOne(id);
    return sub;
  }

  @Patch(':id')
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
  async send(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    const user = this.getUser(req);
    if (user?.role === 'PORTAL') await this.assertPortalOwnsSubscription(user.id, id);
    return this.subscriptionService.send(id);
  }

  @Post(':id/confirm')
  async confirm(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    const user = this.getUser(req);
    if (user?.role === 'PORTAL') await this.assertPortalOwnsSubscription(user.id, id);
    return this.subscriptionService.confirm(id);
  }

  @Post(':id/renew')
  async renew(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    const user = this.getUser(req);
    if (user?.role === 'PORTAL') await this.assertPortalOwnsSubscription(user.id, id);
    return this.subscriptionService.renew(id);
  }

  @Post(':id/close')
  async close(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    const user = this.getUser(req);
    if (user?.role === 'PORTAL') await this.assertPortalOwnsSubscription(user.id, id);
    return this.subscriptionService.close(id);
  }

  @Post(':id/pause')
  async pause(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    const user = this.getUser(req);
    if (user?.role === 'PORTAL') await this.assertPortalOwnsSubscription(user.id, id);
    return this.subscriptionService.pause(id);
  }

  @Post(':id/resume')
  async resume(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    const user = this.getUser(req);
    if (user?.role === 'PORTAL') await this.assertPortalOwnsSubscription(user.id, id);
    return this.subscriptionService.resume(id);
  }

  @Post(':id/invoices')
  async createInvoice(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    const user = this.getUser(req);
    if (user?.role === 'PORTAL') await this.assertPortalOwnsSubscription(user.id, id);
    return this.subscriptionService.createInvoice(id);
  }

  @Post(':id/upsell')
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
  async remove(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    const user = this.getUser(req);
    if (user?.role === 'PORTAL') await this.assertPortalOwnsSubscription(user.id, id);
    return this.subscriptionService.remove(id);
  }
}
