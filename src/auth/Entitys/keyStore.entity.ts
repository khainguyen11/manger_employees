import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { RefreshTokenUsed } from './refreshTokenUsed';
export enum AuthEnum {
  EMPLOYEE_ID = 'employee_id',
  AUTHORIZATION = 'x-authorization',
  REFRESHTOKEN = 'refreshtoken',
}
@Entity()
export class keyStore {
  @PrimaryGeneratedColumn()
  key_store_id: number;
  @Column()
  employees_id: number;
  @Column()
  refresh_token: string;
  @Column()
  access_private_key: string;
  @Column()
  refresh_private_key: string;
  @OneToMany(
    () => RefreshTokenUsed,
    (RefreshTokenUsed) => RefreshTokenUsed.keystore,
  )
  refresh_token_used: RefreshTokenUsed[];
}
