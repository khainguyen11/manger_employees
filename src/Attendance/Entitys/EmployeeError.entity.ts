import { PENALTIES } from 'src/Payroll/Entitys/penalties.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AttendanceEntity } from './attendance.entity';
@Entity()
export class EmployeeError {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: 'enum', enum: PENALTIES })
  message: PENALTIES;
  @ManyToOne(
    () => AttendanceEntity,
    (AttendanceEntity) => AttendanceEntity.status,
  )
  Attendance: AttendanceEntity;
}
