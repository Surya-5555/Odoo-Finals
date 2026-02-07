import {
  Controller,
  Get,
  Post,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { InvoiceState } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guard/roles.guard';
import type { Request } from 'express';

type RequestWithUser = Request & { user?: { id: number; role: string } };

@Controller('invoices')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Get()
  findAll(
    @Req() req: RequestWithUser,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('subscriptionId') subscriptionId?: string,
    @Query('contactId') contactId?: string,
    @Query('state') state?: InvoiceState,
  ) {
    return this.invoiceService.findAll({
      skip: skip ? parseInt(skip, 10) : undefined,
      take: take ? parseInt(take, 10) : undefined,
      subscriptionId: subscriptionId ? parseInt(subscriptionId, 10) : undefined,
      contactId: contactId ? parseInt(contactId, 10) : undefined,
      state,
      requestingUser: req.user,
    });
  }

  @Get(':id')
  findOne(@Req() req: RequestWithUser, @Param('id', ParseIntPipe) id: number) {
    return this.invoiceService.findOneScoped(id, req.user);
  }

  @Post(':id/confirm')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'INTERNAL')
  confirm(@Param('id', ParseIntPipe) id: number) {
    return this.invoiceService.confirm(id);
  }

  @Post(':id/pay')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'INTERNAL')
  markPaid(@Param('id', ParseIntPipe) id: number) {
    return this.invoiceService.markPaid(id);
  }

  @Post(':id/cancel')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'INTERNAL')
  cancel(@Param('id', ParseIntPipe) id: number) {
    return this.invoiceService.cancel(id);
  }
}
