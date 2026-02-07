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
  UseGuards,
} from '@nestjs/common';
import { RecurringPlanService } from './recurring-plan.service';
import { CreateRecurringPlanDto } from './dto/create-recurring-plan.dto';
import { UpdateRecurringPlanDto } from './dto/update-recurring-plan.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guard/roles.guard';

@Controller('recurring-plans')
export class RecurringPlanController {
  constructor(private readonly recurringPlanService: RecurringPlanService) {}

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Post()
  create(@Body() createRecurringPlanDto: CreateRecurringPlanDto) {
    return this.recurringPlanService.create(createRecurringPlanDto);
  }

  @Get()
  findAll(@Query('skip') skip?: string, @Query('take') take?: string) {
    return this.recurringPlanService.findAll({
      skip: skip ? parseInt(skip, 10) : undefined,
      take: take ? parseInt(take, 10) : undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.recurringPlanService.findOne(id);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRecurringPlanDto: UpdateRecurringPlanDto,
  ) {
    return this.recurringPlanService.update(id, updateRecurringPlanDto);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.recurringPlanService.remove(id);
  }
}
