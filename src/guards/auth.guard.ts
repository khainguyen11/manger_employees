import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthEnum } from 'src/auth/Entitys/keyStore.entity';
import { AuthService } from 'src/auth/Services/auth.service';
import { EmployeeService } from 'src/employees/Services/employee.service';
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private authService: AuthService,
    private employeeService: EmployeeService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const employee_id = request.headers[AuthEnum.EMPLOYEE_ID];
    if (!employee_id) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    const keyStore =
      await this.authService.findKeyStoreByEmployeeId(employee_id);
    if (!keyStore) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    if (request.headers[AuthEnum.REFRESHTOKEN]) {
      try {
        const refreshToken = request.headers[AuthEnum.REFRESHTOKEN];

        const decoderEmployee = await this.jwtService.verify(refreshToken, {
          secret: keyStore.refresh_private_key,
        });
        // console.log(decoderEmployee);

        if (decoderEmployee.employee_id.toString() !== employee_id) {
          throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
        }
        request.keyStore = keyStore;
        request.employee = decoderEmployee;
        request.refresh_token = refreshToken;
        return true;
      } catch (error) {
        if (error.name === 'TokenExpiredError') {
          await this.authService.deleteRefreshTokenKey(keyStore);
          throw new UnauthorizedException('Token has expired');
        } else {
          // console.log(error);

          throw new UnauthorizedException('Invalid token');
        }
      }
    }
    // console.log(request.headers);

    const accessToken = request.headers[AuthEnum.AUTHORIZATION];
    // console.log(accessToken);
    // console.log(employee_id);

    try {
      // console.log(keyStore);

      const decoderEmployee = await this.jwtService.verify(accessToken, {
        secret: keyStore.access_private_key,
      });
      // console.log(decoderEmployee);

      if (decoderEmployee.employee_id.toString() !== employee_id) {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }
      request.keyStore = keyStore;
      request.employee = await this.employeeService.findEmployeeByEmail(
        decoderEmployee.employee_email,
      );
    } catch (error) {
      // console.log(error);

      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token has expired');
      } else {
        throw new UnauthorizedException('Invalid token');
      }
    }
    return true;
  }
}
