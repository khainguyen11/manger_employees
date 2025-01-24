import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class signUpEmployeeDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The email of the employee',
    example: 'johndoe@example.com',
  })
  email: string;
  @IsString()
  @ApiProperty({
    description: 'The password of the employee',
    example: 'faefaew3324',
  })
  password: string;
  @ApiProperty({
    description: 'The fullname of the employee',
    example: 'Nguyen Huu Hong Khai',
  })
  full_name: string;
}
