import { ApiProperty } from '@nestjs/swagger';

export class DeleteDto {
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
}
