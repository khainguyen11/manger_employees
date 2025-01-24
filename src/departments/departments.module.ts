import { Module } from '@nestjs/common';
import { DepartmentsService } from './Services/departments.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Departments } from './Entitys/department.entity';
import { EmployeesModule } from 'src/employees/employee.module';
import { DepartmentsController } from './Controllers/departments.controller';
import { EmployeeService } from 'src/employees/Services/employee.service';
import { Employee } from 'src/employees/Entity/employee.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Departments, Employee]), EmployeesModule],
  controllers: [DepartmentsController],
  providers: [DepartmentsService, EmployeeService],
})
export class DepartmentsModule {}
