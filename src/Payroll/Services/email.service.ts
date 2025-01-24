import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;

  constructor() {
    // Cấu hình transporter cho nodemailer
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com', // SMTP host của bạn (e.g., Gmail: smtp.gmail.com)
      port: 587, // Cổng SMTP (Gmail dùng 587)
      secure: false, // True nếu dùng SSL, False nếu không
      auth: {
        user: 'khai1108070707@gmail.com', // Địa chỉ email gửi
        pass: process.env.PASS_EMAIL, // Mật khẩu email
      },
    });
  }

  async sendSalaryEmail(
    to: string,
    subject: string,
    text: string,
    filePath: string,
  ) {
    try {
      const info = await this.transporter.sendMail({
        from: '"khai" <khai1108070707@example.com>', // Tên và địa chỉ email người gửi
        to, // Email người nhận
        subject, // Tiêu đề email
        text, // Nội dung email
        attachments: [
          {
            filename: 'luong-thang.xlsx', // Tên file đính kèm
            path: filePath, // Đường dẫn file cần gửi
          },
        ],
      });

      console.log('Email sent: ', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending email: ', error);
      throw error;
    }
  }
}
