import { Employee } from 'src/employees/Entity/employee.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('departments')
export class Departments {
  @PrimaryGeneratedColumn()
  department_id: number;
  @OneToOne(() => Employee, (Employee) => Employee.department)
  @JoinColumn()
  department_manager: Employee;
  @Column()
  Inauguration_date: Date;
  @Column()
  department_name: String;
}
