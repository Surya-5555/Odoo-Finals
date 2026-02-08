import {
  Controller,
  Get,
  Post,
  Param,
  ParseIntPipe,
  Query,
  Body,
} from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { InvoiceState } from '@prisma/client';
import { PayInvoiceDto } from './dto/pay-invoice.dto';

@Controller('invoices')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Get()
  findAll(
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
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.invoiceService.findOne(id);
  }

  @Post(':id/confirm')
  confirm(@Param('id', ParseIntPipe) id: number) {
    return this.invoiceService.confirm(id);
  }

  @Post(':id/cancel')
  cancel(@Param('id', ParseIntPipe) id: number) {
    return this.invoiceService.cancel(id);
  }

  @Post(':id/restore-draft')
  restoreToDraft(@Param('id', ParseIntPipe) id: number) {
    return this.invoiceService.restoreToDraft(id);
  }

  @Post(':id/pay')
  markPaid(@Param('id', ParseIntPipe) id: number, @Body() dto: PayInvoiceDto) {
    return this.invoiceService.markPaid(id, {
      paymentMethod: dto.paymentMethod,
      paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : undefined,
    });
  }
}
