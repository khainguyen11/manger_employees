import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES } from 'src/employees/Entity/employee.entity';

@Injectable()
export class OwnershipGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const employee = request.employee; // Lấy thông tin người dùng từ token (đã xác thực qua middleware)
    const targetEmployeeId = +request.params.employeeId; // ID của người dùng từ URL

    if (employee.role.toLowerCase === ROLES.MANAGER) {
      return true;
    }
    // Kiểm tra quyền sở hữu
    if (employee.employee_id !== targetEmployeeId) {
      throw new ForbiddenException(
        'You do not have permission to modify this resource.',
      );
    }

    return true;
  }
}
