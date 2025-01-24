import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkSchedule } from './Entitys/workschedule.entity';
import { Employee } from 'src/employees/Entity/employee.entity';
import { WorkScheduleController } from './Controllers/workschedule.controller';
import { WorkScheduleService } from './Services/worlschedule.service';
import { EmployeesModule } from 'src/employees/employee.module';
import { EmployeeService } from 'src/employees/Services/employee.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkSchedule, Employee]),
    EmployeesModule,
  ],
  providers: [WorkScheduleService, EmployeeService],
  controllers: [WorkScheduleController],
})
export class WorkScheduleModule {}
