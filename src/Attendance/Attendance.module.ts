import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceEntity } from './Entitys/attendance.entity';
import { AttendanceController } from './Controllers/attendance.controller';
import { AttendanceService } from './Services/attendance.service';
import { Employee } from 'src/employees/Entity/employee.entity';
import { EmployeesModule } from 'src/employees/employee.module';
import { EmployeeService } from 'src/employees/Services/employee.service';
import { EmployeeError } from './Entitys/EmployeeError.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AttendanceEntity, Employee, EmployeeError]),
    EmployeesModule,
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService, EmployeeService],
})
export class AttendanceModule {}
