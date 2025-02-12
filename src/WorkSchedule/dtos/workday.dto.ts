import { IsString, IsDateString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WorkDayDto {
  @ApiProperty({
    example: '2025-02-10T00:00:00.000Z',
    description: 'Ngày cụ thể (ISO 8601)',
  })
  @IsDateString()
  @IsNotEmpty()
  specific_time: string;

  @ApiProperty({
    example: '08:00',
    description: 'Giờ bắt đầu làm việc (hh:mm)',
  })
  @IsString()
  @IsNotEmpty()
  start_time: string;

  @ApiProperty({
    example: '17:00',
    description: 'Giờ kết thúc làm việc (hh:mm)',
  })
  @IsString()
  @IsNotEmpty()
  end_time: string;
}
