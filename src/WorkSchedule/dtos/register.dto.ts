import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: 'weak of year',
    example: '4',
  })
  weekNumber: number;
  @ApiProperty({
    description: 'year',
    example: '2025',
  })
  year: number;
  @ApiProperty({
    description: 'days of week',
    example: '[0,1,2,3,4,5,6]',
  })
  daysOfWeek: number[];
}
