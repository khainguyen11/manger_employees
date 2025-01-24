import { CanActivate, ExecutionContext } from '@nestjs/common';

export class RolesGuard implements CanActivate {
  constructor(private roles: string[]) {}
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    console.log(request.employee);
    console.log(1);

    return this.roles.includes(request.employee.role.toLowerCase());
  }
}
