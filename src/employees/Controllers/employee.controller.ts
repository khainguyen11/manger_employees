import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from 'src/guards/auth.guard';
import { RolesGuard } from 'src/guards/role.guard';
import { ROLES } from '../Entity/employee.entity';
@UseGuards(AuthGuard)
@Controller('employee')
@UseInterceptors(ClassSerializerInterceptor)
export class EmployeeController {
  @UseGuards(new RolesGuard([ROLES.INTERN]))
  @Get()
  getAllEmployee() {
    console.log('zo day');
  }
  @Post()
  completingInformation() {}
}
