import { Employee } from 'src/employees/Entity/employee.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
export enum DEPARTMENTS {
  DEV = 'developer',
  TEST = 'tester',
  FIRMWARE = 'firmware',
}
@Entity('departments')
export class Departments {
  @PrimaryGeneratedColumn()
  department_id: number;
  @OneToOne(() => Employee, (Employee) => Employee.department_manager)
  @JoinColumn()
  department_manager: Employee;
  @Column()
  Inauguration_date: Date;
  @OneToMany(() => Employee, (Employee) => Employee.department)
  members_of_department: Employee[];
  @Column()
  department_name: String;
}
