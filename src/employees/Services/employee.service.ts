import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Employee } from '../Entity/employee.entity';
import { Repository } from 'typeorm';
import { CompleteEmployee } from '../dtos/complete.employee.dto';
import { WorkSchedule } from 'src/WorkSchedule/Entitys/workschedule.entity';
import { Departments } from 'src/departments/Entitys/department.entity';
import { DepartmentsService } from 'src/departments/Services/departments.service';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    @Inject(forwardRef(() => DepartmentsService))
    private departmentService: DepartmentsService,
  ) {}
  async getAllEmployee() {
    return await this.employeeRepository.find();
  }
  //completeEmployee
  async completeEmployee(information: CompleteEmployee) {
    console.log(information);

    const employee = await this.employeeRepository.findOne({
      where: { employee_id: Number(information.employee) },
      relations: ['workSchedules'],
    });
    const Department = await this.departmentService.get_department_by_name(
      information.department,
    );

    employee.department = Department;
    employee.avatar = information.avatar;
    const emp = await this.employeeRepository.save(employee);

    return emp;
  }
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
