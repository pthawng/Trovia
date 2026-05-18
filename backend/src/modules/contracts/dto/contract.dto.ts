import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
  IsString,
  IsNotEmpty,
  IsNumber,
  IsInt,
  IsDateString,
  IsOptional,
} from 'class-validator';

export class CreateContractDto {
  @ApiProperty({
    example: '85c3d72a-bcbe-4896-bdfe-b0593c9befb9',
    description: 'Rental request ID',
  })
  @IsUUID()
  rentalRequestId: string;

  @ApiProperty({ example: 5500000, description: 'Monthly rent amount' })
  @IsNumber()
  monthlyRent: number;

  @ApiProperty({ example: 5500000, description: 'Security deposit amount' })
  @IsNumber()
  depositAmount: number;

  @ApiProperty({ example: 12, description: 'Duration of contract in months' })
  @IsInt()
  durationMonths: number;

  @ApiProperty({
    example: '2026-06-01T00:00:00Z',
    description: 'Start date of contract',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    example: '2027-05-31T00:00:00Z',
    description: 'End date of contract',
  })
  @IsDateString()
  endDate: string;

  @ApiProperty({
    example: 'Các điều khoản hợp đồng thuê nhà...',
    description: 'Terms and conditions',
  })
  @IsString()
  @IsNotEmpty()
  terms: string;
}

export class UpdateContractDto {
  @ApiProperty({ example: 5500000, required: false })
  @IsNumber()
  @IsOptional()
  monthlyRent?: number;

  @ApiProperty({ example: 5500000, required: false })
  @IsNumber()
  @IsOptional()
  depositAmount?: number;

  @ApiProperty({ example: 12, required: false })
  @IsInt()
  @IsOptional()
  durationMonths?: number;

  @ApiProperty({ example: '2026-06-01T00:00:00Z', required: false })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({ example: '2027-05-31T00:00:00Z', required: false })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({ example: 'Các điều khoản cập nhật...', required: false })
  @IsString()
  @IsOptional()
  terms?: string;
}
