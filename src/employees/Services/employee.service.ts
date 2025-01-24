import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Employee } from '../Entity/employee.entity';
import { Repository } from 'typeorm';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
  ) {}
  async findEmployeeByEmail(emailEmployee: string): Promise<Employee> {
    const employee = await this.employeeRepository.findOneBy({
      email: emailEmployee,
    });
    return employee;
  }
  async findEmployeeByEmailV1(emailEmployee: string): Promise<Employee> {
    const employee = await this.employeeRepository.findOneBy({
      email: emailEmployee,
    });
    if (!employee) {
      throw new HttpException(
        'Can not find Employee by email',
        HttpStatus.BAD_REQUEST,
      );
    }
    return employee;
  }
  async newEmployee({ full_name, email, passwordHash }) {
    const employee = new Employee();
    employee.email = email;
    employee.full_name = full_name;
    employee.password = passwordHash;
    return await this.employeeRepository.save(employee);
  }
}
