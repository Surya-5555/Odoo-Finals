import { Controller, Get, UseGuards } from '@nestjs/common';
import { ReportService } from './report.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guard/roles.guard';

@Controller('reports')
@UseGuards(RolesGuard)
@Roles('ADMIN', 'INTERNAL')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('summary')
  summary() {
    return this.reportService.summary();
  }
}
