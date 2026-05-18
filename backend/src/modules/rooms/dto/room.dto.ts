import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsArray,
  IsUUID,
} from 'class-validator';

export class CreateRoomDto {
  @ApiProperty({ example: 'Phòng 101 - Lầu 1' })
  @IsString()
  title: string;

  @ApiProperty({
    example: 'Phòng rộng thoáng mát, có cửa sổ lớn hướng ra ngoài.',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: 4500000.0,
    description: 'Monthly rental price in VND',
  })
  @IsNumber()
  price: number;

  @ApiProperty({ example: 25.5, description: 'Room area in square meters' })
  @IsNumber()
  area: number;

  @ApiProperty({ example: 4500000.0, description: 'Security deposit in VND' })
  @IsNumber()
  deposit: number;

  @ApiProperty({ example: 2, description: 'Maximum guest capacity' })
  @IsNumber()
  capacity: number;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;

  @ApiProperty({
    example: [],
    description: 'Room-specific amenity IDs',
    required: false,
  })
  @IsArray()
  @IsUUID('all', { each: true })
  @IsOptional()
  amenities?: string[];

  @ApiProperty({ example: '101', required: false })
  @IsString()
  @IsOptional()
  roomNumber?: string;

  @ApiProperty({ example: 1, required: false })
  @IsNumber()
  @IsOptional()
  floor?: number;

  @ApiProperty({ example: 'ANY', required: false })
  @IsString()
  @IsOptional()
  genderRestriction?: string;

  @ApiProperty({ example: 'AVAILABLE', required: false })
  @IsString()
  @IsOptional()
  status?: string;
}

export class UpdateRoomDto {
  @ApiProperty({ example: 'Phòng 101 - Lầu 1 (Cập nhật)', required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  price?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  area?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  deposit?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  capacity?: number;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;

  @ApiProperty({ example: [], required: false })
  @IsArray()
  @IsUUID('all', { each: true })
  @IsOptional()
  amenities?: string[];

  @ApiProperty({ example: '101', required: false })
  @IsString()
  @IsOptional()
  roomNumber?: string;

  @ApiProperty({ example: 1, required: false })
  @IsNumber()
  @IsOptional()
  floor?: number;

  @ApiProperty({ example: 'ANY', required: false })
  @IsString()
  @IsOptional()
  genderRestriction?: string;

  @ApiProperty({ example: 'AVAILABLE', required: false })
  @IsString()
  @IsOptional()
  status?: string;
}
