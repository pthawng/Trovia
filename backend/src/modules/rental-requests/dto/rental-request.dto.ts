import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
  IsString,
  IsOptional,
  IsDateString,
  IsInt,
  Min,
  Max,
  IsEnum,
} from 'class-validator';
import { RentalRequestStatus } from '@prisma/client';

export class CreateRentalRequestDto {
  @ApiProperty({
    example: '85c3d72a-bcbe-4896-bdfe-b0593c9befb9',
    description: 'Property UUID',
  })
  @IsUUID()
  propertyId: string;

  @ApiProperty({
    example: '32b3d72a-bcbe-4896-bdfe-b0593c9befb9',
    description: 'Room UUID',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  roomId?: string;

  @ApiProperty({
    example: '2026-06-01T00:00:00Z',
    description: 'Proposed move-in date',
  })
  @IsDateString()
  moveInDate: string;

  @ApiProperty({ example: 12, description: 'Duration of rental in months' })
  @IsInt()
  @Min(1)
  @Max(120)
  rentalDurationMonths: number;

  @ApiProperty({
    example: 'Tôi muốn thuê từ đầu tháng tới, tôi là sinh viên Bách Khoa.',
    required: false,
  })
  @IsString()
  @IsOptional()
  message?: string;

  @ApiProperty({ example: '0912345678', required: false })
  @IsString()
  @IsOptional()
  phone?: string;
}

export class UpdateRentalRequestStatusDto {
  @ApiProperty({
    enum: RentalRequestStatus,
    example: RentalRequestStatus.ACCEPTED,
  })
  @IsEnum(RentalRequestStatus)
  status: RentalRequestStatus;
}
