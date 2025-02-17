import { Employee } from 'src/employees/Entity/employee.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Payroll {
  @PrimaryGeneratedColumn()
  Payroll_id: number;
  @Column()
  month: string;
  @Column()
  total_day: number;
  @Column()
  base_salary: number;
  @Column()
  hourly_salary: number;
  @Column()
  overtime_pay: number;
  @Column()
  deductions: number;
  @Column()
  total_pay: number;
  @ManyToOne(() => Employee, (Employee) => Employee.payroll)
  employee: Employee;
}
