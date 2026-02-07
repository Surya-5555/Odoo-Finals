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
  UseGuards,
} from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { UpsellSubscriptionDto } from './dto/upsell-subscription.dto';
import { SubscriptionState } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guard/roles.guard';
import type { Request } from 'express';

type RequestWithUser = Request & { user?: { id: number; role: string } };

@Controller('subscriptions')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'INTERNAL')
  create(@Body() createSubscriptionDto: CreateSubscriptionDto) {
    return this.subscriptionService.create(createSubscriptionDto);
  }

  @Get()
  findAll(
    @Req() req: RequestWithUser,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('contactId') contactId?: string,
    @Query('state') state?: SubscriptionState,
  ) {
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
  findOne(@Req() req: RequestWithUser, @Param('id', ParseIntPipe) id: number) {
    return this.subscriptionService.findOneScoped(id, req.user);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'INTERNAL')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
  ) {
    return this.subscriptionService.update(id, updateSubscriptionDto);
  }

  @Post(':id/send')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'INTERNAL')
  send(@Param('id', ParseIntPipe) id: number) {
    return this.subscriptionService.send(id);
  }

  @Post(':id/confirm')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'INTERNAL')
  confirm(@Param('id', ParseIntPipe) id: number) {
    return this.subscriptionService.confirm(id);
  }

  @Post(':id/renew')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'INTERNAL')
  renew(@Param('id', ParseIntPipe) id: number) {
    return this.subscriptionService.renew(id);
  }

  @Post(':id/close')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'INTERNAL')
  close(@Param('id', ParseIntPipe) id: number) {
    return this.subscriptionService.close(id);
  }

  @Post(':id/pause')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'INTERNAL')
  pause(@Param('id', ParseIntPipe) id: number) {
    return this.subscriptionService.pause(id);
  }

  @Post(':id/resume')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'INTERNAL')
  resume(@Param('id', ParseIntPipe) id: number) {
    return this.subscriptionService.resume(id);
  }

  @Post(':id/invoices')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'INTERNAL')
  createInvoice(@Param('id', ParseIntPipe) id: number) {
    return this.subscriptionService.createInvoice(id);
  }

  @Post(':id/upsell')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'INTERNAL')
  upsell(
    @Param('id', ParseIntPipe) id: number,
    @Body() upsellSubscriptionDto: UpsellSubscriptionDto,
  ) {
    return this.subscriptionService.upsell(id, upsellSubscriptionDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'INTERNAL')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.subscriptionService.remove(id);
  }
}
