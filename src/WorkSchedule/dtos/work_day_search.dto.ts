import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class WorkDaySearchDtp {
  @ApiProperty({
    example: '2025-02-20T00:00:00.000Z',
    description: 'ngày bắt đầu tìm kiếm',
  })
  start_time: string;
  @ApiProperty({
    example: '2025-02-10T00:00:00.000Z',
    description: 'ngày cuối cùng tìm kiếm',
  })
  end_time: string;
}
