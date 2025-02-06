import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from 'src/employees/Entity/employee.entity';
import { PostService } from './Services/post.service';
import { PostController } from './Controllers/post.controller';
import { PostEntity } from './Entitys/post.entity';
import { EmployeesModule } from 'src/employees/employee.module';
import { MailService } from 'src/Payroll/Services/email.service';
import { PayrollModule } from 'src/Payroll/payroll.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Employee, PostEntity]),
    EmployeesModule,
    PayrollModule,
  ],
  providers: [PostService],
  controllers: [PostController],
})
export class postModule {}
