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
  id: number;

  @Column()
  workDate: String; // Ngày làm việc đã đăng ký (yyyy-mm-dd)
  @ManyToOne(() => Employee, (Employee) => Employee.workSchedules, {
    onDelete: 'CASCADE',
  })
  employee: Employee;
  @Column()
  weekNumber: number;
  @Column()
  year: number;
}
