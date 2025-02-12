import {
  Body,
  Controller,
  Post,
  Req,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '../Services/auth.service';
import { Employee } from 'src/employees/Entity/employee.entity';
import { signUpEmployeeDto } from '../dto/signUpEmployee.dto';
import { loginEmployeeDto } from '../dto/loginEmployee.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { ApiBody, ApiHeader, ApiHeaders, ApiTags } from '@nestjs/swagger';

@ApiTags('Auths')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @UseGuards(AuthGuard)
  @Post('/employee/me')
  async checkToken() {
    return true;
  }
  @UseGuards(AuthGuard)
  @Post('/employee/login')
  async loginWithToken() {
    return true;
  }
  @Post('signUp')
  @ApiBody({
    description: 'Create a new account',
    type: signUpEmployeeDto, // Dùng DTO ở đây
  })
  signup(@Body() employee: signUpEmployeeDto) {
    return this.authService.signUp(employee);
  }
  @Post('login')
  @ApiBody({
    description: 'login',
    type: loginEmployeeDto, // Dùng DTO ở đây
  })
  login(@Body() employee: loginEmployeeDto) {
    return this.authService.login(employee);
  }
  @UseGuards(AuthGuard)
  @Post('logout')
  logout(@Req() request) {
    return this.authService.logout(request.keyStore);
  }
  @UseGuards(AuthGuard)
  @Post('refresh')
  @ApiHeader({
    name: 'refreshtoken', // Tên của custom header
    description: 'add_refresh_token', // Mô tả cho header
    required: true, // Nếu header này bắt buộc
  })
  refresh(@Req() request) {
    return this.authService.refreshToken(
      request.keyStore,
      request.employee,
      request.refresh_token,
    );
  }
}
