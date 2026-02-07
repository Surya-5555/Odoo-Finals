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
import { QuotationTemplateService } from './quotation-template.service';
import { CreateQuotationTemplateDto } from './dto/create-quotation-template.dto';
import { UpdateQuotationTemplateDto } from './dto/update-quotation-template.dto';

@Controller('quotation-templates')
export class QuotationTemplateController {
  constructor(
    private readonly quotationTemplateService: QuotationTemplateService,
  ) {}

  @Post()
  create(@Body() createQuotationTemplateDto: CreateQuotationTemplateDto) {
    return this.quotationTemplateService.create(createQuotationTemplateDto);
  }

  @Get()
  findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.quotationTemplateService.findAll({
      skip: skip ? parseInt(skip, 10) : undefined,
      take: take ? parseInt(take, 10) : undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.quotationTemplateService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateQuotationTemplateDto: UpdateQuotationTemplateDto,
  ) {
    return this.quotationTemplateService.update(id, updateQuotationTemplateDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.quotationTemplateService.remove(id);
  }
}
