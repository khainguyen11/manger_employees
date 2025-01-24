import { Module } from '@nestjs/common';
import { EmployeeService } from './Services/employee.service';
import { EmployeeController } from './Controllers/employee.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from './Entity/employee.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Employee])],
  providers: [EmployeeService],
  controllers: [EmployeeController],
  exports: [EmployeeService],
})
export class EmployeesModule {}
