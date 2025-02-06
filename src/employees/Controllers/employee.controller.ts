import {
  Body,
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
import { EmployeeService } from '../Services/employee.service';
import { CompleteEmployee } from '../dtos/complete.employee.dto';
import {
  ApiBody,
  ApiConsumes,
  ApiHeaders,
  ApiOperation,
} from '@nestjs/swagger';
@UseGuards(AuthGuard)
@Controller('employee')
@UseInterceptors(ClassSerializerInterceptor)
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
export class EmployeeController {
  constructor(private employeeService: EmployeeService) {}
  @UseGuards(new RolesGuard([ROLES.MANAGER]))
  @Get()
  getAllEmployee() {
    return this.employeeService.getAllEmployee();
  }
  @Post('complete')
  @ApiOperation({ summary: 'Upload avatar for employee' }) // Thêm mô tả Swagger
  @ApiConsumes('multipart/form-data') // Swagger sẽ hiển thị form upload file
  @ApiBody({
    description: 'Complete information for employee',
    type: CompleteEmployee, // Dùng DTO ở đây
  })
  completingInformation(@Body() information: CompleteEmployee) {
    return this.employeeService.completeEmployee(information);
  }
}
