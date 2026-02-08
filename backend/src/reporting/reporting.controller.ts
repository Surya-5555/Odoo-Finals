import { Controller, Get } from '@nestjs/common';
import { ReportingService } from './reporting.service';

@Controller('reports')
export class ReportingController {
  constructor(private readonly reporting: ReportingService) {}

  @Get('summary')
  summary() {
    return this.reporting.summary();
  }
}
