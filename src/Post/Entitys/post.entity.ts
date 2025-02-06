import { Employee } from 'src/employees/Entity/employee.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
type targetRole = 'all' | 'employee' | 'intern' | 'manager';
@Entity()
export class PostEntity {
  @PrimaryGeneratedColumn()
  post_id: number;
  @Column()
  url_image: string;
  @Column({ type: 'longtext' })
  content: string;
  @Column()
  role: targetRole;
  @Column()
  created_at: Date;
  @ManyToOne(() => Employee, (Employee) => Employee.post)
  employee: Employee;
}
