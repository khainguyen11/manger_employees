import { Module } from '@nestjs/common';
import { EmployeesModule } from './employees/employee.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Employee } from './employees/Entity/employee.entity';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { keyStore } from './auth/Entitys/keyStore.entity';
import { RefreshTokenUsed } from './auth/Entitys/refreshTokenUsed';
import { Departments } from './departments/Entitys/department.entity';
import { DepartmentsModule } from './departments/departments.module';
import { WorkSchedule } from './WorkSchedule/Entitys/workschedule.entity';
import { WorkScheduleModule } from './WorkSchedule/workschedule.module';
import { AttendanceEntity } from './Attendance/Entitys/attendance.entity';
import { AttendanceModule } from './Attendance/Attendance.module';
import { EmployeeError } from './Attendance/Entitys/EmployeeError.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { Payroll } from './Payroll/Entitys/payroll.entity';
import { Penalties } from './Payroll/Entitys/penalties.entity';
import { PayrollModule } from './Payroll/payroll.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      // logging: process.env.ENVIROMENT === 'DEV' ? true : false,
      entities: [
        Employee,
        keyStore,
        RefreshTokenUsed,
        Departments,
        WorkSchedule,
        AttendanceEntity,
        EmployeeError,
        Payroll,
        Penalties,
      ],
      synchronize: true,
    }),
    EmployeesModule,
    AuthModule,
    DepartmentsModule,
    WorkScheduleModule,
    AttendanceModule,
    PayrollModule,

    JwtModule.register({
      global: true,
    }),
  ],
})
export class AppModule {}
