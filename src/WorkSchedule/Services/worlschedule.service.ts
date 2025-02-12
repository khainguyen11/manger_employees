import { InjectRepository } from '@nestjs/typeorm';
import { WorkSchedule } from '../Entitys/workschedule.entity';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Between, MoreThanOrEqual, Repository } from 'typeorm';
import { Employee } from 'src/employees/Entity/employee.entity';
import { WorkDayDto } from '../dtos/workday.dto';

@Injectable()
export class WorkScheduleService {
  constructor(
    @InjectRepository(WorkSchedule)
    private workScheduleRepository: Repository<WorkSchedule>,
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
  ) {}
  convertToVietnamTime(date) {
    const dateObj = new Date(date);
    dateObj.setHours(dateObj.getHours() + 7); // Thêm 7 giờ cho múi giờ VN (UTC+7)
    return dateObj;
  }
  subtractDays(date, days) {
    const dateObj = new Date(date);
    dateObj.setDate(dateObj.getDate() - days);
    return dateObj;
  }
  async deleteScheduleForIntern(employee_id: number, { start_time, end_time }) {
    // 🕒 Lấy ngày hôm nay (chỉ giữ lại phần ngày, không lấy giờ)
    const today = this.convertToVietnamTime(new Date());
    today.setHours(0, 0, 0, 0); // Đặt giờ về 00:00:00 để so sánh chính xác
    if (start_time > today) {
      throw new BadRequestException('khong the xoa ngày đã qua');
    }
    if (start_time && !end_time) {
      return await this.workScheduleRepository.delete({
        employee: { employee_id: employee_id },
        specific_time: MoreThanOrEqual(start_time),
      });
    }
    if (end_time && !start_time) {
      return await this.workScheduleRepository.delete({
        employee: { employee_id: employee_id },
        specific_time: Between(today, start_time),
      });
    }
    if (start_time && end_time) {
      return await this.workScheduleRepository.delete({
        employee: { employee_id: employee_id },
        specific_time: Between(start_time, end_time),
      });
    }
    // 🔎 Kiểm tra lịch có thuộc ngày hôm nay hoặc tương lai không
    // 🗑️ Xóa lịch làm việc cũ từ hôm nay trở đi của nhân viên này
    return await this.workScheduleRepository.delete({
      employee: { employee_id: employee_id },
      specific_time: MoreThanOrEqual(today),
    });
  }
  async updateScheduleForIntern(
    employee_id: number,
    workSchedules: WorkDayDto[],
  ) {
    // 🔎 Kiểm tra nhân viên có tồn tại không
    const employee = await this.employeeRepository.findOne({
      where: { employee_id },
    });
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    // 🕒 Lấy ngày hôm nay (chỉ giữ lại phần ngày, không lấy giờ)
    const today = this.convertToVietnamTime(new Date());
    today.setHours(0, 0, 0, 0); // Đặt giờ về 00:00:00 để so sánh chính xác

    // 🔎 Kiểm tra lịch có thuộc ngày hôm nay hoặc tương lai không
    for (const schedule of workSchedules) {
      const scheduleDate = new Date(schedule.specific_time);
      scheduleDate.setHours(0, 0, 0, 0); // Loại bỏ phần giờ để so sánh chính xác
      if (scheduleDate < today) {
        throw new BadRequestException(
          'Không thể chỉnh sửa lịch của ngày đã qua.',
        );
      }
    }

    // 🗑️ Xóa lịch làm việc cũ từ hôm nay trở đi của nhân viên này
    await this.workScheduleRepository.delete({
      employee: { employee_id },
      specific_time: MoreThanOrEqual(today),
    });

    // 💾 Lưu lịch làm việc mới
    const newSchedules = workSchedules.map((s) => {
      const schedule = new WorkSchedule();
      schedule.employee = employee;
      schedule.specific_time = s.specific_time;
      schedule.start_time = s.start_time;
      schedule.end_time = s.end_time;
      return schedule;
    });

    return await this.workScheduleRepository.save(newSchedules);
  }
  async createScheduleForIntern(employee_id, workSchedule) {
    console.log('create');

    const employee = await this.employeeRepository.findOne({
      where: { employee_id: employee_id },
    });
    // 🕒 Lấy ngày hôm nay (chỉ giữ lại phần ngày, không lấy giờ)
    const today = this.convertToVietnamTime(new Date());
    today.setHours(0, 0, 0, 0); // Đặt giờ về 00:00:00 để so sánh chính xác

    const work_schedule = [];
    for (const s of workSchedule) {
      const scheduleDate = new Date(s.specific_time);
      scheduleDate.setHours(0, 0, 0, 0);

      if (scheduleDate < today) {
        throw new BadRequestException(
          `Không thể tạo lịch cho ngày đã qua: ${s.specific_time}`,
        );
      }
      const Schedule = new WorkSchedule();
      Schedule.employee = employee;
      Schedule.specific_time = s.specific_time;
      Schedule.start_time = s.start_time;
      Schedule.end_time = s.end_time;
      work_schedule.push(Schedule);
    }
    return await this.workScheduleRepository.save(work_schedule);
  }
  async Get_the_week_schedule(employee_id) {
    const date = this.convertToVietnamTime(new Date());
    const start_date = this.subtractDays(date, date.getDay() - 1);
    const end_date = this.subtractDays(start_date, -6);
    return await this.workScheduleRepository.find({
      where: {
        employee: { employee_id: employee_id },
        specific_time: Between(start_date, end_date),
      },
      relations: ['employee'],
    });
  }
  async Get_the_schedule(employee_id, { start_time, end_time }) {
    const today = this.convertToVietnamTime(new Date());
    today.setHours(0, 0, 0, 0); // Đặt giờ về 00:00:00 để so sánh chính xác

    if (!start_time || !end_time) {
      return await this.Get_the_week_schedule(employee_id);
    }
    if (start_time && !end_time) {
      return await this.workScheduleRepository.find({
        where: {
          employee: { employee_id: employee_id },
          specific_time: Between(start_time, today),
        },
        relations: ['employee'],
      });
    }
    if (!start_time && end_time) {
      const start_date = this.subtractDays(today, today.getDay() - 1);
      const end_date = this.subtractDays(start_date, -6);
      return await this.workScheduleRepository.find({
        where: {
          employee: { employee_id: employee_id },
          specific_time: Between(start_date, end_date),
        },
        relations: ['employee'],
      });
    }
    return await this.workScheduleRepository.find({
      where: {
        employee: { employee_id: employee_id },
        specific_time: Between(start_time, end_time),
      },
      relations: ['employee'],
    });
  }
  async Get_the_schedule_of_all_employee({ start_time, end_time }) {
    console.log('get schedule of employee');

    const today = this.convertToVietnamTime(new Date());
    today.setHours(0, 0, 0, 0); // Đặt giờ về 00:00:00 để so sánh chính xác
    if (!start_time || !end_time) {
      const start_date = this.subtractDays(today, today.getDay() - 1);
      const end_date = this.subtractDays(start_date, -6);
      return await this.workScheduleRepository.find({
        where: {
          specific_time: Between(start_date, end_date),
        },
        relations: ['employee'],
      });
    }
    return await this.workScheduleRepository.find({
      where: {
        specific_time: Between(start_time, end_time),
      },
      relations: ['employee'],
    });
  }
}
