import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { log } from 'console';
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

  isValidJwtFormat(token) {
    console.log('voday');
    if (!token) {
      return false;
    }
    // Kiểm tra xem JWT có ba phần không, mỗi phần được phân tách bằng dấu chấm
    const parts = token.split('.');
    return parts.length === 3;
  }

  parseJWT(token) {
    console.log('voday');

    if (!this.isValidJwtFormat(token)) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    const base64Url = token.split('.')[1]; // Lấy phần payload
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = Buffer.from(base64, 'base64').toString();
    return JSON.parse(jsonPayload);
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    let id_employee = null;
    if (request.headers[AuthEnum.REFRESHTOKEN]) {
      const { employee_id } = this.parseJWT(
        request.headers[AuthEnum.REFRESHTOKEN],
      );
      id_employee = employee_id;
    } else {
      let auth;
      if (request.headers[AuthEnum.AUTHORIZATION]) {
        if (!this.isValidJwtFormat(request.headers[AuthEnum.AUTHORIZATION])) {
          throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
        }
        auth = request.headers[AuthEnum.AUTHORIZATION].split(' ')[1];
      }
      const { employee_id } = this.parseJWT(auth);
      id_employee = employee_id;
    }
    // console.log(employee_id);
    const keyStore =
      await this.authService.findKeyStoreByEmployeeId(id_employee);
    // console.log(keyStore);

    if (!keyStore) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    if (request.headers[AuthEnum.REFRESHTOKEN]) {
      console.log('vao day');

      try {
        const refreshToken = request.headers[AuthEnum.REFRESHTOKEN];

        const decoderEmployee = await this.jwtService.verify(refreshToken, {
          secret: keyStore.refresh_private_key,
        });
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
    } else {
      try {
        // console.log(keyStore);
        let access_token;
        if (request.headers[AuthEnum.AUTHORIZATION]) {
          if (!this.isValidJwtFormat(request.headers[AuthEnum.AUTHORIZATION])) {
            throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
          }
          access_token = request.headers[AuthEnum.AUTHORIZATION].split(' ')[1];
        }
        const decoderEmployee = await this.jwtService.verify(access_token, {
          secret: keyStore.access_private_key,
        });
        // console.log(decoderEmployee);
        request.keyStore = keyStore;
        request.employee = await this.employeeService.findEmployeeByEmail(
          decoderEmployee.employee_email,
        );
        return true;
      } catch (error) {
        // console.log(error);

        if (error.name === 'TokenExpiredError') {
          throw new UnauthorizedException('Token has expired');
        } else {
          throw new UnauthorizedException('Invalid token');
        }
      }
    }
  }
}
