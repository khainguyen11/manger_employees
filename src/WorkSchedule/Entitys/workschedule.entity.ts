import { Exclude } from 'class-transformer';
import { Employee } from 'src/employees/Entity/employee.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity()
export class WorkSchedule {
  @PrimaryGeneratedColumn()
  @Exclude()
  id: number;
  @Column()
  specific_time: String;
  @Column()
  start_time: String;
  @Column()
  end_time: String;
  @ManyToOne(() => Employee, (Employee) => Employee.workSchedules, {
    onDelete: 'CASCADE',
  })
  employee: Employee;
}
