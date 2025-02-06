import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
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
import { MulterModule } from '@nestjs/platform-express';
import { postModule } from './Post/post.module';
import { PostEntity } from './Post/Entitys/post.entity';
import { FileUploadMiddleware } from './middlewares/upload-file.middleware';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads/images', // Thư mục lưu trữ hình ảnh tải lên
    }),
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
        PostEntity,
      ],
      synchronize: true,
    }),
    EmployeesModule,
    AuthModule,
    DepartmentsModule,
    WorkScheduleModule,
    AttendanceModule,
    PayrollModule,
    postModule,

    JwtModule.register({
      global: true,
    }),
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(FileUploadMiddleware)
      .forRoutes('posts/uploads', 'employee/complete');
  }
}
