import {
  Injectable,
  NestMiddleware,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as multer from 'multer';
import { extname } from 'path';
import { diskStorage } from 'multer';
import { AuthEnum } from 'src/auth/Entitys/keyStore.entity';

@Injectable()
export class FileUploadMiddleware implements NestMiddleware {
  private upload = multer({
    storage: diskStorage({
      destination: './uploads/images', // Thư mục lưu file
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        callback(null, `${uniqueSuffix}${ext}`);
      },
    }),
    limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn dung lượng mỗi file 5MB
    fileFilter: (req, file, callback) => {
      const allowedExtensions = ['.png', '.jpg', '.jpeg', '.pdf'];
      const fileExt = extname(file.originalname).toLowerCase();

      if (!allowedExtensions.includes(fileExt)) {
        return callback(null, false);
      }

      callback(null, true); // Cho phép file hợp lệ
    },
  }).any(); // Chấp nhận cả 1 file hoặc nhiều file
  private upload_avatar = multer({
    storage: diskStorage({
      destination: './uploads/avatars', // Thư mục lưu file
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        callback(null, `${uniqueSuffix}${ext}`);
      },
    }),
    limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn dung lượng mỗi file 5MB
    fileFilter: (req, file, callback) => {
      const allowedExtensions = ['.png', '.jpg', '.jpeg', '.pdf'];
      const fileExt = extname(file.originalname).toLowerCase();

      if (!allowedExtensions.includes(fileExt)) {
        return callback(null, false);
      }

      callback(null, true); // Cho phép file hợp lệ
    },
  }).any(); // Chấp nhận cả 1 file hoặc nhiều file

  use(req: Request, res: Response, next: NextFunction) {
    // Xử lý upload file
    console.log(req.baseUrl);

    if (req.baseUrl === '/v1/api/post/uploads') {
      this.upload(req, res, (err) => {
        if (err) {
          // console.error('Lỗi trong quá trình upload file:', err);
          return res.status(400).json({
            message: 'Lỗi trong quá trình upload file.',
            error: err,
          });
        } else {
          const files = req.files as Express.Multer.File[] | undefined;
          req.body.files = files; // Thêm files vào req.body
          req.body.employee = req.headers[AuthEnum.EMPLOYEE_ID];
          // console.log('Files đã tải lên:', files);
          next(); // Tiếp tục yêu cầu đến controller nếu không có lỗi
        }
      });
    }
    if (req.baseUrl === '/v1/api/employee/complete') {
      // console.log('va0');

      this.upload_avatar(req, res, (err) => {
        if (err) {
          // console.error('Lỗi trong quá trình upload file:', err);
          return res.status(400).json({
            message: 'Lỗi trong quá trình upload file.',
            error: err,
          });
        } else {
          const files = req.files as Express.Multer.File[] | undefined;
          req.body.avatar = files[0].filename; // Thêm files vào req.body
          req.body.employee = req.headers[AuthEnum.EMPLOYEE_ID];
          // console.log('Files đã tải lên:', files);
          next(); // Tiếp tục yêu cầu đến controller nếu không có lỗi
        }
      });
    }
  }
}
