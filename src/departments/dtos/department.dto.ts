import { ApiProperty } from '@nestjs/swagger';

export class departmentDto {
  @ApiProperty({
    description: 'The name of the department',
    example: 'developer',
  })
  department_name: string;
  @ApiProperty({
    description: 'The email of the department',
    example: 'johndoe@example.com',
  })
  department_manager_email: String;
}
