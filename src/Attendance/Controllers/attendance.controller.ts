import {
  Body,
  Controller,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { LocationDto } from '../dtos/location.dto';
import { AttendanceService } from '../Services/attendance.service';
import { ApiBody, ApiHeaders } from '@nestjs/swagger';
import { AuthGuard } from 'src/guards/auth.guard';
import { OwnershipGuard } from 'src/guards/ownership.guard';
@UseGuards(AuthGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}
  @Post('checkin/:employeeId')
  @UseGuards(OwnershipGuard)
  @ApiBody({ description: 'checkIn for employee', type: LocationDto })
  async checkIn(
    @Param('employeeId', ParseIntPipe) employeeId: number,
    @Body() location: LocationDto,
  ) {
    const check_in = await this.attendanceService.check_in(
      employeeId,
      location,
    );
    return {
      status: HttpStatus.OK,
      data: {
        check_in,
      },
    };
  }
  @Post('checkout/:employeeId')
  @UseGuards(OwnershipGuard)
  @ApiBody({ description: 'checkOut for employee', type: LocationDto })
  async checkOut(
    @Param('employeeId', ParseIntPipe) employeeId: number,
    @Body() location: LocationDto,
  ) {
    const check_out = await this.attendanceService.check_out(
      employeeId,
      location,
    );
    return {
      status: HttpStatus.OK,
      data: {
        check_out,
      },
    };
  }
}
