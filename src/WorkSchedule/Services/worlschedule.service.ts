import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WorkSchedule } from '../Entitys/workschedule.entity';
import { Between, Repository } from 'typeorm';
import { Employee } from 'src/employees/Entity/employee.entity';
import { RegisterDto } from '../dtos/register.dto';
import { register } from 'module';
import { DeleteDto } from '../dtos/delete.dto';

@Injectable()
export class WorkScheduleService {
  constructor(
    @InjectRepository(WorkSchedule)
    private workScheduleRepository: Repository<WorkSchedule>,
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
  ) {}
  private getStartDateOfWeek(weekNumber: number, year: number) {
    const firstDayOfYear = new Date(year, 0, 1);
    const daysOffSet = (weekNumber - 1) * 7 - firstDayOfYear.getDay() + 1; //offSet start at monday
    firstDayOfYear.setDate(firstDayOfYear.getDate() + daysOffSet);
    return firstDayOfYear;
  }
  async registerAndUpdateWeeklySchedule(
    employee_id: number,
    Register: RegisterDto,
  ) {
    const employee = await this.employeeRepository.findOneBy({
      employee_id: employee_id,
    });
    //check employee is existed
    if (!employee) {
      throw new HttpException('employee not found', HttpStatus.NOT_FOUND);
    }
    //check input
    if (Register.daysOfWeek.length === 0) {
      throw new HttpException(
        'Days of week cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    const startDate = this.getStartDateOfWeek(
      Register.weekNumber,
      Register.year,
    );
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    const schedules: WorkSchedule[] = [];
    const currentDate = new Date(startDate);
    //Check if you already have a calendar for the week

    await this.workScheduleRepository.delete({
      employee: { employee_id: employee_id },
      workDate: Between(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0],
      ),
    });

    //create new calender for week
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay(); //0:sunday; 1: monday....
      if (Register.daysOfWeek.includes(dayOfWeek)) {
        const workschedule = new WorkSchedule();
        workschedule.employee = employee;
        workschedule.workDate = currentDate.toISOString().split('T')[0];
        workschedule.weekNumber = Register.weekNumber;
        workschedule.year = Register.year;
        schedules.push(workschedule);
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return await this.workScheduleRepository.save(schedules);
  }
  async deleteWeekSchedule(employee_id: number, deleteDto: DeleteDto) {
    const employee = await this.employeeRepository.findOneBy({
      employee_id: employee_id,
    });
    //check employee is existed
    if (!employee) {
      throw new HttpException('employee not found', HttpStatus.NOT_FOUND);
    }
    const startDate = this.getStartDateOfWeek(
      deleteDto.weekNumber,
      deleteDto.year,
    );
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    //Check if you already have a calendar for the week
    await this.workScheduleRepository.delete({
      employee: { employee_id: employee_id },
      workDate: Between(startDate.toISOString(), endDate.toISOString()),
    });
  }
  async getSchedule() {
    return await this.workScheduleRepository.find({
      relations: { employee: true },
    });
  }
  async getDetailSchedule(employee_id: number) {
    return await this.workScheduleRepository.find({
      where: { employee: { employee_id: employee_id } },
      relations: { employee: true },
    });
  }
}
