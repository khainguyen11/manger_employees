import { ApiProperty } from '@nestjs/swagger';
import { DEPARTMENTS } from 'src/departments/Entitys/department.entity';

export class CompleteEmployee {
  employee: string;
  @ApiProperty({
    description: 'Department of employee',
    example: DEPARTMENTS.DEV,
  })
  department: DEPARTMENTS;

  @ApiProperty({
    description: 'Avatar file',
    type: 'string',
    format: 'binary',
  })
  avatar: any; // Thay string thành any để hỗ trợ file
}
