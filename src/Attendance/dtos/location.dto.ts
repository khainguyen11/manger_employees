import { ApiProperty } from '@nestjs/swagger';

export class LocationDto {
  @ApiProperty({
    description: 'vi do',
    example: '12091',
  })
  latitude: string;
  @ApiProperty({
    description: 'kinh do',
    example: '120',
  })
  longitude: string;
}
