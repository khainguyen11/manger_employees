import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { RegisterDto } from '../dtos/register.dto';
import { WorkScheduleService } from '../Services/worlschedule.service';
import { DeleteDto } from '../dtos/delete.dto';
import { RolesGuard } from 'src/guards/role.guard';
import { ROLES } from 'src/employees/Entity/employee.entity';
import { AuthGuard } from 'src/guards/auth.guard';
import { ApiBody, ApiHeaders } from '@nestjs/swagger';
import { OwnershipGuard } from 'src/guards/ownership.guard';
@UseGuards(AuthGuard)
@Controller('work-schedules')
@ApiHeaders([
  {
    name: 'x-authorization', // Tên của custom header
    description: 'add access token', // Mô tả cho header
    required: true, // Nếu header này bắt buộc
  },
  {
    name: 'employee_id', // Tên của custom header
    description: 'add employee_id', // Mô tả cho header
    required: true, // Nếu header này bắt buộc
  },
])
export class WorkScheduleController {
  constructor(private workScheduleService: WorkScheduleService) {}
  @Post('week/:employeeId')
  @UseGuards(OwnershipGuard)
  @ApiBody({
    description: 'register schedule',
    type: RegisterDto,
  })
  async registerWeeklySchedule(
    @Param('employeeId', ParseIntPipe) employeeId: number,
    @Body() register: RegisterDto,
  ) {
    const registerSuccess =
      await this.workScheduleService.registerAndUpdateWeeklySchedule(
        employeeId,
        register,
      );
    return {
      status: HttpStatus.CREATED,
      metadata: registerSuccess,
    };
  }
  @ApiBody({
    description: 'update schedule',
    type: RegisterDto,
  })
  @Put('week/:employeeId')
  @UseGuards(OwnershipGuard)
  async update(
    @Param('employeeId', ParseIntPipe) employeeId: number,
    @Body() register: RegisterDto,
  ) {
    const registerSuccess =
      await this.workScheduleService.registerAndUpdateWeeklySchedule(
        employeeId,
        register,
      );
    return {
      status: HttpStatus.CREATED,
      metadata: registerSuccess,
    };
  }
  @ApiBody({
    description: 'delete schedule',
    type: DeleteDto,
  })
  @UseGuards(OwnershipGuard)
  @Delete('week/:employeeId')
  async delete(
    @Param('employeeId', ParseIntPipe) employeeId: number,
    @Body() deleteDto: DeleteDto,
  ) {
    const Success = this.workScheduleService.deleteWeekSchedule(
      employeeId,
      deleteDto,
    );
    return {
      status: HttpStatus.OK,
      metadata: Success,
    };
  }
  @UseGuards(new RolesGuard([ROLES.MANAGER]))
  @Get('week')
  async get() {
    const data = await this.workScheduleService.getSchedule();
    return {
      status: HttpStatus.OK,
      metadata: data,
    };
  }
  @UseGuards(OwnershipGuard)
  @Get('week/detail/:employeeId')
  async getDetailSchedule(
    @Param('employeeId', ParseIntPipe) employeeId: number,
  ) {
    const data = await this.workScheduleService.getDetailSchedule(employeeId);
    return {
      status: HttpStatus.OK,
      metadata: data,
    };
  }
}
