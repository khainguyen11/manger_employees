import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DEPARTMENTS, Departments } from '../Entitys/department.entity';
import { Repository } from 'typeorm';
import { EmployeeService } from 'src/employees/Services/employee.service';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Departments)
    private departmentRepository: Repository<Departments>,
    @Inject(forwardRef(() => EmployeeService))
    private employeeService: EmployeeService,
  ) {}
  async saveDepartment(department) {
    await this.departmentRepository.save(department);
  }
  async createDepartment(newDepartment) {
    const Department = new Departments();
    Department.department_name = newDepartment.department_name;
    Department.manager = await this.employeeService.findEmployeeByEmailV1(
      newDepartment.department_manager_email,
    );

    const newDate = new Date();
    Department.Inauguration_date = newDate;
    return await this.departmentRepository.save(Department);
  }
  async updateDepartment(id, updateDepartment) {
    const Department = await this.departmentRepository.findOneBy({
      department_id: id,
    });
    Department.department_name = updateDepartment.department_name;
    Department.manager = await this.employeeService.findEmployeeByEmailV1(
      updateDepartment.department_manager_email,
    );
    return await this.departmentRepository.save(Department);
  }
  async deleteDepartment(id: number) {
    return await this.departmentRepository.delete({ department_id: id });
  }
  async getAllDepartment() {
    return await this.departmentRepository.find();
  }
  async get_department_detail(id: number) {
    return await this.departmentRepository.findOne({
      where: { department_id: id },
    });
  }
  async get_department_by_name(name: DEPARTMENTS) {
    return await this.departmentRepository.findOne({
      where: { department_name: name },
      relations: ['members'],
    });
  }
}
