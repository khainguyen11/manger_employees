import { Employee } from 'src/employees/Entity/employee.entity';
import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EmployeeError } from './EmployeeError.entity';

@Entity()
export class AttendanceEntity {
  @PrimaryGeneratedColumn()
  attendance_id: number;
  @Column()
  date: String;
  @Column({ nullable: true })
  check_in: String;
  @Column({ nullable: true })
  check_out: String;
  @OneToMany(() => EmployeeError, (EmployeeError) => EmployeeError.Attendance)
  status: EmployeeError[];
  @Column({ nullable: true })
  overtime_hours: number;

  @ManyToOne(() => Employee, (Employee) => Employee.attendances, {
    cascade: true,
  })
  employees: Employee;
}
