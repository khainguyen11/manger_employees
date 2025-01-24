import { Global, Module } from '@nestjs/common';
import { AuthController } from './Controllers/auth.controller';
import { AuthService } from './Services/auth.service';
import { EmployeesModule } from 'src/employees/employee.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { keyStore } from './Entitys/keyStore.entity';
import { RefreshTokenUsed } from './Entitys/refreshTokenUsed';
@Global()
@Module({
  imports: [
    EmployeesModule,
    TypeOrmModule.forFeature([keyStore, RefreshTokenUsed]),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
