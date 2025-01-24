import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { keyStore } from './keyStore.entity';

@Entity()
export class RefreshTokenUsed {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  refreshToken: string;
  @ManyToOne(() => keyStore, (keyStore) => keyStore.refresh_token_used)
  keystore: keyStore;
}
