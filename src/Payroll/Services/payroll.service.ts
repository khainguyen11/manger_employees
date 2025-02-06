import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payroll } from '../Entitys/payroll.entity';
import { PENALTIES, Penalties } from '../Entitys/penalties.entity';
import { Cron } from '@nestjs/schedule';
import { AttendanceEntity } from 'src/Attendance/Entitys/attendance.entity';
import { Employee, ROLES } from 'src/employees/Entity/employee.entity';
import { EmployeeError } from 'src/Attendance/Entitys/EmployeeError.entity';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { MailService } from './email.service';
import { log } from 'console';
@Injectable()
export class PayrollService {
  constructor(
    @InjectRepository(Payroll) private payrollRepository: Repository<Payroll>,
    @InjectRepository(Penalties)
    private penaltyRepository: Repository<Penalties>,
    @InjectRepository(AttendanceEntity)
    private attendanceRepository: Repository<AttendanceEntity>,
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    @InjectRepository(EmployeeError)
    private employeeErrorRepository: Repository<EmployeeError>,
    private mailService: MailService,
  ) {}
  getDayOfWeek(dateString) {
    const date = new Date(dateString);
    return date.getDay();
  }
  convert_hour_to_number(n) {
    const hourArray = n.split(':');
    return Number(hourArray[0]) + Number(hourArray[1]) / 60;
  }
  round_the_number(n) {
    return Math.round(n / 1000) * 1000;
  }
  Back_to_last_month(date) {
    const offset = 2 * 60 * 60 * 1000;
    return new Date(date.getTime() - offset);
  }
  convertToVN(date) {
    const offset = 7 * 60 * 60 * 1000; // GMT+7
    // const offset = 0;
    return new Date(date.getTime() + offset);
  }
  async get__attendance(e_id, month, year) {
    return await this.attendanceRepository.query(
      `
              SELECT * FROM attendance_entity
              WHERE employeesEmployeeId = ?
                  AND MONTH(STR_TO_DATE(date,'%Y-%m-%d')) = ?
                  AND YEAR(STR_TO_DATE(date,'%Y-%m-%d')) = ?;
          `,
      [e_id, month, year],
    );
  }
  async get_All_employee(role) {
    // get all employee
    const all_employee = await this.employeeRepository.find({
      where: { role: role },
    });
    console.log(all_employee);

    if (!all_employee || all_employee.length === 0) {
      console.log('No employees found');
      return; // Return here to exit the function if no employees are found
    }
    return all_employee;
  }
  @Cron('0 1 1 * *', { timeZone: 'Asia/Ho_Chi_Minh' })
  // @Cron('2 * * * * *', { timeZone: 'Asia/Ho_Chi_Minh' })
  async calc_total_pay_for_employee() {
    try {
      const PEN = await this.penaltyRepository.find();

      console.log(PEN);
      //get date
      const date = this.Back_to_last_month(this.convertToVN(new Date()));
      // const date = this.convertToVN(new Date());
      console.log(date);

      //get_all_employee
      const all_employee = await this.get_All_employee(ROLES.EMPLOYEE);
      if (!all_employee || all_employee.length === 0) {
        console.log('No employees found for payroll processing.');
        return;
      }
      for (const employee of all_employee) {
        //get all day in one month of employee

        const attendance = await this.get__attendance(
          employee.employee_id,
          date.getMonth() + 1,
          date.getFullYear(),
        );
        console.log(attendance);
        if (!attendance || attendance.length === 0) {
          console.log('No salary');
          continue;
        }
        //calc error for employee
        let minus = +process.env.BASE_SALARY / 22;
        let deductions = 0;
        let overtime_hours = 0;
        let total_day_go_to_work = attendance.length;
        for (const c_attendance of attendance) {
          if (!c_attendance.check_out) {
            total_day_go_to_work -= 1;
            continue;
          }
          const day = this.getDayOfWeek(c_attendance.date);
          console.log(day);
          if (day == 0 || day == 6) {
            total_day_go_to_work -= 1;
            overtime_hours += c_attendance.overtime_hours;
            console.log(overtime_hours);
            continue;
          }
          overtime_hours += c_attendance.overtime_hours;

          const error = await this.employeeErrorRepository.find({
            where: {
              Attendance: { attendance_id: c_attendance.attendance_id },
            },
          });
          error.forEach((error) => {
            switch (error.message) {
              case PENALTIES.LATE:
                PEN.forEach((fine) => {
                  if (fine.type === PENALTIES.LATE) {
                    deductions += fine.fine;
                  }
                });
                break;
              case PENALTIES.LEAVE_EARLY:
                PEN.forEach((fine) => {
                  if (fine.type === PENALTIES.LEAVE_EARLY) {
                    deductions += fine.fine;
                  }
                });
                break;
              case PENALTIES.BE_ON_LEAVE:
                PEN.forEach((fine) => {
                  if (fine.type === PENALTIES.LATE) {
                    deductions += 0;
                  }
                });
                break;
            }
          });
        }
        console.log(deductions);
        console.log(overtime_hours);
        const PAYROLL_FOR_EMPLOYEE = new Payroll();
        PAYROLL_FOR_EMPLOYEE.month = date
          .toISOString()
          .split('T')[0]
          .split('-')[1];
        PAYROLL_FOR_EMPLOYEE.total_day = total_day_go_to_work;
        PAYROLL_FOR_EMPLOYEE.base_salary = +process.env.BASE_SALARY;
        PAYROLL_FOR_EMPLOYEE.hourly_salary = 0;
        PAYROLL_FOR_EMPLOYEE.overtime_pay =
          overtime_hours * +process.env.OVERTIME_SALARY;
        PAYROLL_FOR_EMPLOYEE.deductions = deductions;
        PAYROLL_FOR_EMPLOYEE.total_pay =
          total_day_go_to_work * minus +
          overtime_hours * +process.env.OVERTIME_SALARY -
          deductions;
        PAYROLL_FOR_EMPLOYEE.employee = employee;
        await this.payrollRepository.save(PAYROLL_FOR_EMPLOYEE);
      }
    } catch (error) {
      console.log(error);
    }
  }
  @Cron('0 1 1 * *', { timeZone: 'Asia/Ho_Chi_Minh' })
  // @Cron('2 * * * * *', { timeZone: 'Asia/Ho_Chi_Minh' })
  async calc_total_pay_for_intern() {
    try {
      //get date
      const date = this.Back_to_last_month(this.convertToVN(new Date()));

      // const date = this.convertToVN(new Date());

      //get_all_employee
      const all_employee = await this.get_All_employee(ROLES.INTERN);
      if (!all_employee || all_employee.length === 0) {
        console.log('No employees found for payroll processing.');
        return;
      }
      for (const employee of all_employee) {
        //get all day in one month of employee
        const deductions = 0;
        let total_pay = 0;
        let overtime_hours = 0;
        console.log(
          employee.employee_id,
          date.getMonth() + 1,
          date.getFullYear(),
        );
        const attendance = await this.get__attendance(
          employee.employee_id,
          date.getMonth() + 1,
          date.getFullYear(),
        );
        console.log(attendance);
        if (!attendance || attendance.length === 0) {
          console.log('No salary');
          continue;
        }
        // viết lại logic này đang lạ
        let total_day_go_to_work = attendance.length;
        for (const day_attendance of attendance) {
          if (!day_attendance.check_out) {
            total_day_go_to_work -= 1;
            continue;
          }
          const day = this.getDayOfWeek(day_attendance.date);
          if (day == 0 || day == 6) {
            overtime_hours += day_attendance.overtime_hours;
            console.log(overtime_hours);

            continue;
          }
          overtime_hours += day_attendance.overtime_hours;
          const checkInTime = this.convert_hour_to_number(
            day_attendance.check_in,
          );
          const checkOutTime = this.convert_hour_to_number(
            day_attendance.check_out,
          );
          let total_hour = 0;

          // Kiểm tra nếu nhân viên làm sau 14h thì trừ đi 2 giờ nghỉ trưa
          if (checkOutTime > 14) {
            total_hour = checkOutTime - checkInTime - 2;
          } else {
            total_hour = 12.5 - checkInTime;
          }

          // Cập nhật tổng lương
          total_pay += total_hour * +process.env.HOUR_SALARY;
        }
        console.log(total_pay);
        console.log(overtime_hours);

        const PAYROLL_FOR_INTERN = new Payroll();
        PAYROLL_FOR_INTERN.month = date
          .toISOString()
          .split('T')[0]
          .split('-')[1];
        PAYROLL_FOR_INTERN.total_day = total_day_go_to_work;
        PAYROLL_FOR_INTERN.base_salary = 0;
        PAYROLL_FOR_INTERN.hourly_salary = +process.env.HOUR_SALARY;
        PAYROLL_FOR_INTERN.overtime_pay = this.round_the_number(
          overtime_hours * +process.env.OVERTIME_SALARY,
        );
        PAYROLL_FOR_INTERN.deductions = deductions;
        PAYROLL_FOR_INTERN.employee = employee;
        PAYROLL_FOR_INTERN.total_pay =
          this.round_the_number(total_pay) +
          this.round_the_number(overtime_hours * +process.env.OVERTIME_SALARY);
        await this.payrollRepository.save(PAYROLL_FOR_INTERN);
      }
    } catch (error) {
      console.log(error);
    }
  }
  async exportToExcel(res: Response, month: string) {
    try {
      console.log('vao day');

      const queryPayroll = await this.payrollRepository.find({
        where: { month: month },
        relations: ['employee'],
      });
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Sheet1');

      // Dữ liệu mẫu để đưa vào Excel
      const dataPayroll = queryPayroll.map((Payroll) => {
        return {
          month: Payroll.month,
          name_employee: Payroll.employee.full_name,
          role: Payroll.employee.role,
          base_salary: Payroll.base_salary,
          hourly_salary: Payroll.hourly_salary,
          overtime_salary: Payroll.overtime_pay,
          deductions: Payroll.deductions,
          total_day: Payroll.total_day,
          total_pay: Payroll.total_pay,
        };
      });
      console.log(dataPayroll);

      // Đặt tên cho các cột
      worksheet.columns = [
        { header: 'Tháng', key: 'month', width: 15 },
        { header: 'Họ và Tên', key: 'name_employee', width: 30 },
        { header: 'chức vụ', key: 'role', width: 20 },
        { header: 'tiền lương', key: 'base_salary', width: 20 },
        { header: 'tiền lương theo giờ', key: 'hourly_salary', width: 20 },
        { header: 'tiền lương tăng ca', key: 'overtime_salary', width: 20 },
        { header: 'tiền phạt', key: 'deductions', width: 20 },
        { header: 'tổng ngày làm', key: 'total_day', width: 20 },
        { header: 'tiền lương thực nhận', key: 'total_pay', width: 20 },
      ];

      // Thêm dữ liệu vào sheet
      dataPayroll.forEach((item) => {
        const row = worksheet.addRow(item);
        // Cập nhật font cho các ô
        row.eachCell((cell) => {
          cell.font = { name: 'Times New Roman', size: 12 }; // Thiết lập font chữ là Times New Roman
          cell.alignment = { horizontal: 'left' }; // Căn chỉnh tất cả các ô sang trái
        });
      });

      // Thiết lập header và kiểu dữ liệu
      res.header(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.header(
        'Content-Disposition',
        `attachment; filename=baocaobangluongthang${month}.xlsx`,
      );

      // Xuất workbook ra định dạng excel và gửi qua response
      await workbook.xlsx.write(res);
    } catch (error) {
      console.log(error);
    }
  }
  @Cron('0 1 1 * *', { timeZone: 'Asia/Ho_Chi_Minh' })
  //   @Cron('5 * * * * *', { timeZone: 'Asia/Ho_Chi_Minh' })
  async exportToExcelAndSendEmail() {
    let filePath: string; // Biến lưu đường dẫn file Excel
    try {
      console.log('Bắt đầu tạo file Excel và gửi email');
      //get last month
      const date = this.Back_to_last_month(this.convertToVN(new Date()));
      const month = date.toISOString().split('T')[0].split('-')[1];
      // Lấy dữ liệu bảng lương từ database
      const queryPayroll = await this.payrollRepository.find({
        where: { month: month },
        relations: ['employee'],
      });

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Sheet1');

      // Chuẩn bị dữ liệu cho Excel
      const dataPayroll = queryPayroll.map((Payroll) => ({
        month: Payroll.month,
        name_employee: Payroll.employee.full_name,
        role: Payroll.employee.role,
        base_salary: Payroll.base_salary,
        hourly_salary: Payroll.hourly_salary,
        overtime_salary: Payroll.overtime_pay,
        deductions: Payroll.deductions,
        total_day: Payroll.total_day,
        total_pay: Payroll.total_pay,
      }));

      // Thiết lập các cột cho Excel
      worksheet.columns = [
        { header: 'Tháng', key: 'month', width: 15 },
        { header: 'Họ và Tên', key: 'name_employee', width: 30 },
        { header: 'Chức vụ', key: 'role', width: 20 },
        { header: 'Tiền lương', key: 'base_salary', width: 20 },
        { header: 'Tiền lương theo giờ', key: 'hourly_salary', width: 20 },
        { header: 'Tiền lương tăng ca', key: 'overtime_salary', width: 20 },
        { header: 'Tiền phạt', key: 'deductions', width: 20 },
        { header: 'Tổng ngày làm', key: 'total_day', width: 20 },
        { header: 'Tiền lương thực nhận', key: 'total_pay', width: 20 },
      ];

      // Thêm dữ liệu vào worksheet
      dataPayroll.forEach((item) => {
        const row = worksheet.addRow(item);
        row.eachCell((cell) => {
          cell.font = { name: 'Times New Roman', size: 12 };
          cell.alignment = { horizontal: 'left' };
        });
      });

      // Lưu file Excel tạm thời vào server
      const uploadDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir); // Tạo thư mục nếu chưa tồn tại
      }
      filePath = path.join(uploadDir, `luong-thang-${month}.xlsx`);
      await workbook.xlsx.writeFile(filePath);

      // Gửi email với file Excel đính kèm
      //query manager
      const employee = await this.employeeRepository.find({
        where: { role: ROLES.MANAGER },
      });
      for (const empl of employee) {
        await this.mailService.sendSalaryEmail(
          empl.email,
          `Bảng lương tháng ${month}`,
          'Đây là bảng lương của nhân viên tháng này.',
          filePath,
        );
      }

      // Xóa file tạm sau khi gửi email
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Lỗi xảy ra:', error);

      // Xóa file tạm nếu xảy ra lỗi
      if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  }
}
