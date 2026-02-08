import {
  Controller,
  Get,
  Post,
  Param,
  ParseIntPipe,
  Query,
  Body,
  Req,
  ForbiddenException,
  NotFoundException,
  StreamableFile,
} from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { InvoiceState } from '@prisma/client';
import { PayInvoiceDto } from './dto/pay-invoice.dto';
import { PrismaService } from '../../prisma/prisma.service';
import type { Request } from 'express';
import PDFDocument from 'pdfkit';

@Controller('invoices')
export class InvoiceController {
  constructor(
    private readonly invoiceService: InvoiceService,
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

  private async assertPortalOwnsInvoice(userId: number, invoiceId: number) {
    const portalContactId = await this.getPortalContactIdOrThrow(userId);
    const inv = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      select: { id: true, contactId: true },
    });
    if (!inv || inv.contactId !== portalContactId) {
      throw new ForbiddenException('Insufficient permissions');
    }
  }

  @Get()
  findAll(
    @Req() req: Request,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('subscriptionId') subscriptionId?: string,
    @Query('contactId') contactId?: string,
    @Query('state') state?: InvoiceState,
  ) {
    const user = this.getUser(req);
    if (user?.role === 'PORTAL') {
      return this.getPortalContactIdOrThrow(user.id).then((portalContactId) =>
        this.invoiceService.findAll({
          skip: skip ? parseInt(skip, 10) : undefined,
          take: take ? parseInt(take, 10) : undefined,
          subscriptionId: subscriptionId ? parseInt(subscriptionId, 10) : undefined,
          contactId: portalContactId,
          state,
        }),
      );
    }
    return this.invoiceService.findAll({
      skip: skip ? parseInt(skip, 10) : undefined,
      take: take ? parseInt(take, 10) : undefined,
      subscriptionId: subscriptionId ? parseInt(subscriptionId, 10) : undefined,
      contactId: contactId ? parseInt(contactId, 10) : undefined,
      state,
    });
  }

  @Get(':id')
  async findOne(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    const user = this.getUser(req);
    if (user?.role === 'PORTAL') {
      await this.assertPortalOwnsInvoice(user.id, id);
    }
    return this.invoiceService.findOne(id);
  }

  @Get(':id/pdf')
  async downloadPdf(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    const user = this.getUser(req);
    if (user?.role === 'PORTAL') {
      await this.assertPortalOwnsInvoice(user.id, id);
    }

    const inv = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        contact: true,
        subscription: true,
        lines: { include: { product: true } },
      },
    });
    if (!inv) throw new NotFoundException('Invoice not found');

    const total = inv.lines.reduce((sum, l) => sum + Number(l.amount ?? 0), 0);

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];
    doc.on('data', (c) => chunks.push(c as Buffer));
    const bufferPromise = new Promise<Buffer>((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
    });

    doc.fontSize(20).text(`Invoice ${inv.number}`, { align: 'left' });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor('#555');
    doc.text(`Status: ${inv.state}`);
    doc.text(`Invoice date: ${inv.invoiceDate.toISOString().slice(0, 10)}`);
    doc.text(`Due date: ${inv.dueDate.toISOString().slice(0, 10)}`);
    doc.moveDown(0.8);

    doc.fillColor('#111').fontSize(12).text('Bill To');
    doc.fontSize(10).fillColor('#333');
    doc.text(inv.contact?.name ?? '—');
    doc.text(inv.contact?.email ?? '—');
    if (inv.contact?.address) doc.text(inv.contact.address);
    doc.moveDown(1);

    doc.fillColor('#111').fontSize(12).text('Items');
    doc.moveDown(0.3);
    doc.fontSize(10).fillColor('#333');
    inv.lines.forEach((l) => {
      const desc = l.description ?? l.product?.name ?? `Product #${l.productId}`;
      doc.text(
        `${desc}  |  Qty ${l.quantity}  |  Unit ${Number(l.unitPrice).toFixed(2)}  |  Amount ${Number(l.amount).toFixed(2)}`,
      );
    });
    doc.moveDown(1);
    doc.fontSize(12).fillColor('#111').text(`Total: ${total.toFixed(2)}`, { align: 'right' });

    doc.end();
    const buffer = await bufferPromise;

    return new StreamableFile(buffer, {
      type: 'application/pdf',
      disposition: `attachment; filename="${inv.number}.pdf"`,
    });
  }

  @Post(':id/confirm')
  async confirm(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    const user = this.getUser(req);
    if (user?.role === 'PORTAL') await this.assertPortalOwnsInvoice(user.id, id);
    return this.invoiceService.confirm(id);
  }

  @Post(':id/cancel')
  async cancel(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    const user = this.getUser(req);
    if (user?.role === 'PORTAL') await this.assertPortalOwnsInvoice(user.id, id);
    return this.invoiceService.cancel(id);
  }

  @Post(':id/restore-draft')
  async restoreToDraft(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    const user = this.getUser(req);
    if (user?.role === 'PORTAL') await this.assertPortalOwnsInvoice(user.id, id);
    return this.invoiceService.restoreToDraft(id);
  }

  @Post(':id/pay')
  async markPaid(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: PayInvoiceDto,
  ) {
    const user = this.getUser(req);
    if (user?.role === 'PORTAL') await this.assertPortalOwnsInvoice(user.id, id);
    return this.invoiceService.markPaid(id, {
      paymentMethod: dto.paymentMethod,
      paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : undefined,
    });
  }
}
