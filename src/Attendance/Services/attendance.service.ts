import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { AttendanceEntity } from '../Entitys/attendance.entity';
import { Repository } from 'typeorm';
import { Employee } from 'src/employees/Entity/employee.entity';
import { LocationDto } from '../dtos/location.dto';
import { EmployeeError } from '../Entitys/EmployeeError.entity';
import { PENALTIES } from 'src/Payroll/Entitys/penalties.entity';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(AttendanceEntity)
    private attendanceRepository: Repository<AttendanceEntity>,
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    @InjectRepository(EmployeeError)
    private employeeErrorRepository: Repository<EmployeeError>,
  ) {}
  private readonly locationCompany = {
    companyLon: process.env.LONGITUDE,
    companyLat: process.env.LATITUDE,
  };
  error = 0;
  convertToVN(date) {
    const offset = 7 * 60 * 60 * 1000; // GMT+7
    // const offset = 0;
    return new Date(date.getTime() + offset);
  }
  haversine(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
  }
  async check_in(employee_id: number, LocationClient: LocationDto) {
    const today = new Date();
    const todayAtVN = this.convertToVN(today).toISOString().split('T')[0];
    console.log(todayAtVN);

    const existingAttendance = await this.attendanceRepository.findOne({
      where: {
        date: todayAtVN,
        employees: { employee_id: employee_id },
      },
      relations: ['employees'],
    });
    if (existingAttendance) {
      throw new HttpException(
        'you are already checked in today',
        HttpStatus.FORBIDDEN,
      );
    }
    //save info check in
    const employee = await this.employeeRepository.findOne({
      where: { employee_id: employee_id },
    });

    if (!employee) {
      throw new HttpException('Employee not found.', HttpStatus.FORBIDDEN);
    }
    const distance = this.haversine(
      this.locationCompany.companyLat,
      this.locationCompany.companyLon,
      LocationClient.latitude,
      LocationClient.longitude,
    );

    if (distance * 1000 > 2000) {
      throw new HttpException(
        "can't check in because it's too far from the company",
        HttpStatus.BAD_REQUEST,
      );
    }
    const currentTime = new Date();
    const currentVnTime = this.convertToVN(currentTime);
    console.log(currentVnTime);

    if (currentVnTime.getHours() > 9) {
      throw new HttpException(
        "can not check in because it's too late",
        HttpStatus.FORBIDDEN,
      );
    }

    const attendance = new AttendanceEntity();
    attendance.employees = employee;
    attendance.check_in =
      currentVnTime.getHours() + ':' + currentVnTime.getMinutes();
    attendance.date = todayAtVN;
    return this.attendanceRepository.save(attendance);
  }
  async check_out(employee_id: number, LocationClient: LocationDto) {
    // check employee is existed
    const employee = this.employeeRepository.findOne({
      where: { employee_id: employee_id },
    });
    if (!employee) {
      throw new HttpException('Employee not found', HttpStatus.FORBIDDEN);
    }
    // If the employee has not checked in
    const day = new Date().toISOString().split('T')[0];
    const attendance = await this.attendanceRepository.findOne({
      where: {
        employees: { employee_id: employee_id },
        date: day,
      },
    });
    if (!attendance.check_in) {
      throw new HttpException(
        "Can not check_out because don't find data check in",
        HttpStatus.FORBIDDEN,
      );
    }
    // calc distance from employee to company
    const distance = this.haversine(
      this.locationCompany.companyLat,
      this.locationCompany.companyLon,
      LocationClient.latitude,
      LocationClient.longitude,
    );
    if (distance * 1000 > 2000) {
      throw new HttpException(
        "can't check in because it's too far from the company",
        HttpStatus.BAD_REQUEST,
      );
    }
    //check out
    const date = new Date();
    const current_vn_time = this.convertToVN(date);
    attendance.check_out = `${current_vn_time.getHours}:${current_vn_time.getMinutes}`;
    return this.attendanceRepository.save(attendance);
  }
  //convert hour to number
  converHToN(attendance: String) {
    if (!attendance) {
      return 0;
    }
    const check_out_time = attendance.split(':').map((data) => {
      return Number(data);
    });
    return check_out_time[0] + check_out_time[1] / 60;
  }
  @Cron('55 23 * * *', { timeZone: 'Asia/Ho_Chi_Minh' })
  async handleOvertimeCheck() {
    console.log('vao day');

    const afterworkhours = 17.5;
    const date = new Date().toISOString().split('T')[0];
    const attendance = await this.attendanceRepository.find({
      where: {
        date: date,
      },
    });
    if (!attendance) {
      return;
    }
    const newAttendance = attendance.map((attendance) => {
      if (!attendance.check_in || !attendance.check_out) {
        return attendance;
      }

      if (
        this.converHToN(attendance.check_out) > afterworkhours &&
        new Date().getDay() !== 0 &&
        new Date().getDay() !== 6
      ) {
        const overtime = this.converHToN(attendance.check_out) - afterworkhours;
        attendance.overtime_hours = overtime;
      }
      if (new Date().getDay() === 0 || new Date().getDay() === 6) {
        let overtime = null;
        if (Number(attendance.check_out.split(':')[0]) > 13) {
          overtime =
            this.converHToN(attendance.check_out) -
            this.converHToN(attendance.check_in) -
            2;
        }
        overtime =
          this.converHToN(attendance.check_out) -
          this.converHToN(attendance.check_in);
        attendance.overtime_hours = overtime;
      }
      return attendance;
    });
    this.attendanceRepository.save(newAttendance);
  }
  @Cron('55 23 * * 1-5', { timeZone: 'Asia/Ho_Chi_Minh' })
  async handleErrorCheck() {
    try {
      console.log('vao day');

      const dateObj = this.convertToVN(new Date()).toISOString();
      console.log(dateObj);
      let date = null;
      if (typeof dateObj === 'string' && dateObj.includes('T')) {
        date = dateObj.split('T')[0];
        console.log('Date:', date);
      } else {
        console.error('Lỗi: Không thể tách chuỗi ISO');
      }
      const Attendance = await this.attendanceRepository.find({
        where: {
          date: date,
        },
      });
      if (!Attendance) {
        return;
      }
      const newAttendance = [];
      for (const attendance of Attendance) {
        attendance.status = [];
        if (!attendance.check_out) {
          this.error = 1;
          const error = new EmployeeError();
          error.message = PENALTIES.BE_ON_LEAVE;
          error.Attendance = attendance;
          await this.employeeErrorRepository.save(error); // Chờ cho đến khi lưu lỗi
          attendance.status.push(error); // Thêm lỗi vào status
        }
        if (
          this.converHToN(attendance.check_in) > 9 &&
          this.converHToN(attendance.check_in) !== 0 &&
          this.converHToN(attendance.check_out) !== 0
        ) {
          this.error = 1;
          const error = new EmployeeError();
          error.message = PENALTIES.LATE;
          error.Attendance = attendance;
          await this.employeeErrorRepository.save(error); // Chờ cho đến khi lưu lỗi
          attendance.status.push(error); // Thêm lỗi vào status
        }
        if (
          this.converHToN(attendance.check_out) < 5 &&
          this.converHToN(attendance.check_out) !== 0 &&
          this.converHToN(attendance.check_in) !== 0
        ) {
          this.error = 1;
          const error = new EmployeeError();
          error.message = PENALTIES.LEAVE_EARLY;
          error.Attendance = attendance;
          await this.employeeErrorRepository.save(error); // Chờ cho đến khi lưu lỗi
          attendance.status.push(error); // Thêm lỗi vào status
        }
        if (!this.error) {
          const error = new EmployeeError();
          error.message = PENALTIES.NORMAL;
          error.Attendance = attendance;
          await this.employeeErrorRepository.save(error); // Chờ cho đến khi lưu lỗi
          attendance.status.push(error); // Thêm lỗi vào status
          this.error = 0;
        }
        newAttendance.push(attendance);
      }
      await this.attendanceRepository.save(newAttendance);
    } catch (error) {
      console.log(error);
    }
  }
}
