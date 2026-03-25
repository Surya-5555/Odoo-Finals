import {
<<<<<<< HEAD
=======
  BadRequestException,
>>>>>>> 34d8f0563272fc3ffddc6ac63922119f2dfd0da5
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
<<<<<<< HEAD
  UseGuards,
=======
>>>>>>> 34d8f0563272fc3ffddc6ac63922119f2dfd0da5
} from '@nestjs/common';
import { DiscountService } from './discount.service';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
<<<<<<< HEAD
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guard/roles.guard';

@Controller('discounts')
@UseGuards(RolesGuard)
@Roles('ADMIN')
=======

@Controller('discounts')
>>>>>>> 34d8f0563272fc3ffddc6ac63922119f2dfd0da5
export class DiscountController {
  constructor(private readonly discountService: DiscountService) {}

  @Post()
  create(@Body() dto: CreateDiscountDto) {
    return this.discountService.create(dto);
  }

  @Get()
  findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
<<<<<<< HEAD
    @Query('active') active?: string,
  ) {
    return this.discountService.findAll({
      skip: skip ? parseInt(skip, 10) : undefined,
      take: take ? parseInt(take, 10) : undefined,
      active: active != null ? active === 'true' : undefined,
=======
    @Query('q') q?: string,
    @Query('isActive') isActive?: string,
  ) {
    let isActiveBool: boolean | undefined = undefined;
    if (isActive !== undefined) {
      if (isActive === 'true') isActiveBool = true;
      else if (isActive === 'false') isActiveBool = false;
      else throw new BadRequestException('isActive must be true or false');
    }

    return this.discountService.findAll({
      skip: skip ? parseInt(skip, 10) : undefined,
      take: take ? parseInt(take, 10) : undefined,
      q: q?.trim() ? q.trim() : undefined,
      isActive: isActiveBool,
    });
  }

  @Get('validate')
  validate(@Query('code') code?: string, @Query('productId') productId?: string) {
    return this.discountService.validate(code ?? '', {
      productId: productId ? parseInt(productId, 10) : undefined,
>>>>>>> 34d8f0563272fc3ffddc6ac63922119f2dfd0da5
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.discountService.findOne(id);
  }

  @Patch(':id')
<<<<<<< HEAD
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDiscountDto,
  ) {
=======
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateDiscountDto) {
>>>>>>> 34d8f0563272fc3ffddc6ac63922119f2dfd0da5
    return this.discountService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.discountService.remove(id);
  }
}
