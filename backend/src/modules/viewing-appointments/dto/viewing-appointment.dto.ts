import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { ViewingAppointmentStatus } from '@prisma/client';

export class CreateViewingAppointmentDto {
  @ApiProperty({
    example: '2026-06-01T15:00:00Z',
    description: 'Scheduled viewing date/time',
  })
  @IsDateString()
  scheduledAt: string;

  @ApiProperty({
    example: '22 Đường 8, Linh Trung, Thủ Đức',
    description: 'Location of property',
  })
  @IsString()
  location: string;

  @ApiProperty({
    example: 'Vui lòng đến đúng giờ để xem phòng sạch sẽ.',
    required: false,
  })
  @IsString()
  @IsOptional()
  note?: string;
}

export class UpdateViewingStatusDto {
  @ApiProperty({
    enum: ViewingAppointmentStatus,
    example: ViewingAppointmentStatus.CONFIRMED,
  })
  @IsEnum(ViewingAppointmentStatus)
  status: ViewingAppointmentStatus;
}
