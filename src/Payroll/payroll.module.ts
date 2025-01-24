import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payroll } from './Entitys/payroll.entity';
import { Penalties } from './Entitys/penalties.entity';
import { AttendanceEntity } from 'src/Attendance/Entitys/attendance.entity';
import { Employee } from 'src/employees/Entity/employee.entity';
import { PayrollService } from './Services/payroll.service';
import { EmployeeError } from 'src/Attendance/Entitys/EmployeeError.entity';
import { payrollController } from './Controllers/payroll.controller';
import { MailService } from './Services/email.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Payroll,
      Penalties,
      AttendanceEntity,
      Employee,
      EmployeeError,
    ]),
  ],
  controllers: [payrollController],
  providers: [PayrollService, MailService],
})
export class PayrollModule {}
