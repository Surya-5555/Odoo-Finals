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
} from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { UpsellSubscriptionDto } from './dto/upsell-subscription.dto';
import { SubscriptionState } from '@prisma/client';

@Controller('subscriptions')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post()
  create(@Body() createSubscriptionDto: CreateSubscriptionDto) {
    return this.subscriptionService.create(createSubscriptionDto);
  }

  @Get()
  findAll(
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
    });
  }

  @Get('by-number/:number')
  findByNumber(@Param('number') number: string) {
    return this.subscriptionService.findByNumber(number);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.subscriptionService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
  ) {
    return this.subscriptionService.update(id, updateSubscriptionDto);
  }

  @Post(':id/send')
  send(@Param('id', ParseIntPipe) id: number) {
    return this.subscriptionService.send(id);
  }

  @Post(':id/confirm')
  confirm(@Param('id', ParseIntPipe) id: number) {
    return this.subscriptionService.confirm(id);
  }

  @Post(':id/renew')
  renew(@Param('id', ParseIntPipe) id: number) {
    return this.subscriptionService.renew(id);
  }

  @Post(':id/close')
  close(@Param('id', ParseIntPipe) id: number) {
    return this.subscriptionService.close(id);
  }

  @Post(':id/pause')
  pause(@Param('id', ParseIntPipe) id: number) {
    return this.subscriptionService.pause(id);
  }

  @Post(':id/resume')
  resume(@Param('id', ParseIntPipe) id: number) {
    return this.subscriptionService.resume(id);
  }

  @Post(':id/invoices')
  createInvoice(@Param('id', ParseIntPipe) id: number) {
    return this.subscriptionService.createInvoice(id);
  }

  @Post(':id/upsell')
  upsell(
    @Param('id', ParseIntPipe) id: number,
    @Body() upsellSubscriptionDto: UpsellSubscriptionDto,
  ) {
    return this.subscriptionService.upsell(id, upsellSubscriptionDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.subscriptionService.remove(id);
  }
}
