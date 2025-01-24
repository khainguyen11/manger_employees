import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
export enum PENALTIES {
  NORMAL = 'normal',
  LATE = 'late',
  LEAVE_EARLY = 'leave_early',
  BE_ON_LEAVE = 'be_on_leave',
}
@Entity()
export class Penalties {
  @PrimaryGeneratedColumn()
  penalty_id: number;
  @Column({ type: 'enum', enum: PENALTIES, default: PENALTIES.NORMAL })
  type: PENALTIES;
  @Column()
  fine: number;
}
