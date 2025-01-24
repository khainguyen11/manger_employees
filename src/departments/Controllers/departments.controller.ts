import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ROLES } from 'src/employees/Entity/employee.entity';
import { AuthGuard } from 'src/guards/auth.guard';
import { RolesGuard } from 'src/guards/role.guard';
import { departmentDto } from '../dtos/department.dto';
import { DepartmentsService } from '../Services/departments.service';
import { ApiBody, ApiHeaders } from '@nestjs/swagger';

@Controller('departments')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(AuthGuard, new RolesGuard([ROLES.INTERN]))
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
export class DepartmentsController {
  constructor(private departmentService: DepartmentsService) {}
  @Post()
  @ApiBody({
    description: 'Create a new department',
    type: departmentDto, // Dùng DTO ở đây
  })
  async createDepartment(@Body() newDepartment: departmentDto) {
    const Department =
      await this.departmentService.createDepartment(newDepartment);
    return {
      status: 201,
      metadata: Department,
    };
  }

  @Patch('/:id')
  @ApiBody({
    description: 'update a new department',
    type: departmentDto, // Dùng DTO ở đây
  })
  async updateDepartment(
    @Param('id') id: String,
    @Body() updateDepartment: departmentDto,
  ) {
    const departmentAfterUpdate = await this.departmentService.updateDepartment(
      id,
      updateDepartment,
    );
    return {
      status: 201,
      metadata: departmentAfterUpdate,
    };
  }
  @Get()
  async getAllDepartment() {
    const all_department = await this.departmentService.getAllDepartment();
    return {
      status: 200,
      metadata: all_department,
    };
  }
  @Get('/:id')
  async getDepartment(@Param('id', ParseIntPipe) id: number) {
    const department_detail =
      await this.departmentService.get_department_detail(id);
    return {
      status: 200,
      metadata: department_detail,
    };
  }

  @Delete('/:id')
  async deleteDepartment(@Param('id', ParseIntPipe) id: number) {
    const department_delete = await this.departmentService.deleteDepartment(id);
    return {
      status: 201,
      metadata: department_delete,
    };
  }
}
