import { Exclude } from 'class-transformer';
import { AttendanceEntity } from 'src/Attendance/Entitys/attendance.entity';
import { Departments } from 'src/departments/Entitys/department.entity';
import { Payroll } from 'src/Payroll/Entitys/payroll.entity';
import { WorkSchedule } from 'src/WorkSchedule/Entitys/workschedule.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
export enum ROLES {
  MANAGER = 'manager',
  EMPLOYEE = 'employee',
  INTERN = 'intern',
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
  @OneToOne(() => Departments, (Departments) => Departments.department_manager)
  department: Departments;
  @ManyToOne(() => WorkSchedule, (WorkSchedule) => WorkSchedule.employee)
  workSchedules: WorkSchedule[];
  @OneToMany(
    () => AttendanceEntity,
    (AttendanceEntity) => AttendanceEntity.employees,
  )
  attendances: AttendanceEntity[];
  @OneToOne(() => Payroll, (Payroll) => Payroll.employee)
  payroll: Employee;
}
