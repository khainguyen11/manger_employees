import { Post } from '@nestjs/common';
import { Exclude } from 'class-transformer';
import { AttendanceEntity } from 'src/Attendance/Entitys/attendance.entity';
import { Departments } from 'src/departments/Entitys/department.entity';
import { Payroll } from 'src/Payroll/Entitys/payroll.entity';
import { PostEntity } from 'src/Post/Entitys/post.entity';
import { WorkSchedule } from 'src/WorkSchedule/Entitys/workschedule.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
export enum ROLES {
  MANAGER = 'manager',
  EMPLOYEE = 'employee',
  INTERN = 'intern',
  ALL = 'all',
}
@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn()
  employee_id: number;
  @Column()
  email: string;
  @Column()
  full_name: string;
  @Exclude()
  @Column()
  password: string;
  @Exclude()
  @Column({ default: ROLES.INTERN })
  role: string;
  @Column()
  avatar: string;
  @OneToOne(() => Departments, (Departments) => Departments.department_manager)
  department_manager: Departments;
  @OneToMany(() => WorkSchedule, (workSchedule) => workSchedule.employee)
  workSchedules: WorkSchedule[];
  @OneToMany(
    () => AttendanceEntity,
    (AttendanceEntity) => AttendanceEntity.employees,
  )
  attendances: AttendanceEntity[];
  @OneToMany(() => Payroll, (Payroll) => Payroll.employee)
  payroll: Payroll[];
  @OneToMany(() => PostEntity, (PostEntity) => PostEntity.employee)
  post: PostEntity[];
  @ManyToOne(
    () => Departments,
    (Departments) => Departments.members_of_department,
  )
  department: Departments;
}
