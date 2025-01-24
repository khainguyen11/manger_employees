import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { PayrollService } from '../Services/payroll.service';
import { Response } from 'express';
import { ApiBody } from '@nestjs/swagger';

@Controller('payroll')
export class payrollController {
  constructor(private payrollService: PayrollService) {}
  @Post('export')
  @ApiBody({
    description: 'enter month',
    schema: {
      type: 'object',
      properties: {
        month: {
          type: 'string',
          description: 'month',
        },
      },
      required: ['month'],
    },
  })
  exportToExcel(@Res() res: Response, @Body() month: string) {
    return this.payrollService.exportToExcel(res, month);
  }
}
