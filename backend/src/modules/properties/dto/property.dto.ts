import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsArray,
  IsUUID,
} from 'class-validator';
import { PropertyType, PropertyStatus } from '@prisma/client';

export class CreatePropertyDto {
  @ApiProperty({ example: 'Căn hộ dịch vụ cao cấp Bình Thạnh' })
  @IsString()
  title: string;

  @ApiProperty({
    example: 'Căn hộ đầy đủ tiện nghi, giờ giấc tự do, an ninh tốt.',
  })
  @IsString()
  description: string;

  @ApiProperty({ example: '456 Điện Biên Phủ, Phường 25, Bình Thạnh' })
  @IsString()
  address: string;

  @ApiProperty({ example: 'Hồ Chí Minh' })
  @IsString()
  city: string;

  @ApiProperty({ example: 'Bình Thạnh' })
  @IsString()
  district: string;

  @ApiProperty({ example: 'Phường 25' })
  @IsString()
  ward: string;

  @ApiProperty({ example: 10.8012, required: false })
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiProperty({ example: 106.7123, required: false })
  @IsNumber()
  @IsOptional()
  longitude?: number;

  @ApiProperty({ enum: PropertyType, example: PropertyType.APARTMENT })
  @IsEnum(PropertyType)
  type: PropertyType;

  @ApiProperty({
    enum: PropertyStatus,
    example: PropertyStatus.DRAFT,
    required: false,
  })
  @IsEnum(PropertyStatus)
  @IsOptional()
  status?: PropertyStatus;

  @ApiProperty({
    example: ['https://example.com/img1.jpg'],
    description: 'Property image URLs',
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @ApiProperty({ example: [], description: 'Amenity IDs', required: false })
  @IsArray()
  @IsUUID('all', { each: true })
  @IsOptional()
  amenities?: string[];

  @ApiProperty({ example: 3, required: false })
  @IsNumber()
  @IsOptional()
  totalFloors?: number;

  @ApiProperty({ example: 12, required: false })
  @IsNumber()
  @IsOptional()
  totalUnits?: number;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  hasParking?: boolean;

  @ApiProperty({ example: 'Điện: 4000/kWh, Nước: 100000/người', required: false })
  @IsString()
  @IsOptional()
  utilities?: string;

  @ApiProperty({ example: 'Không nuôi thú cưng, không làm ồn sau 23h', required: false })
  @IsString()
  @IsOptional()
  rules?: string;
}

export class UpdatePropertyDto {
  @ApiProperty({
    example: 'Căn hộ dịch vụ cao cấp Bình Thạnh (Cập nhật)',
    required: false,
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  district?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  ward?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  longitude?: number;

  @ApiProperty({ enum: PropertyType, required: false })
  @IsEnum(PropertyType)
  @IsOptional()
  type?: PropertyType;

  @ApiProperty({ enum: PropertyStatus, required: false })
  @IsEnum(PropertyStatus)
  @IsOptional()
  status?: PropertyStatus;

  @ApiProperty({ example: [], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @ApiProperty({ example: [], required: false })
  @IsArray()
  @IsUUID('all', { each: true })
  @IsOptional()
  amenities?: string[];

  @ApiProperty({ example: 3, required: false })
  @IsNumber()
  @IsOptional()
  totalFloors?: number;

  @ApiProperty({ example: 12, required: false })
  @IsNumber()
  @IsOptional()
  totalUnits?: number;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  hasParking?: boolean;

  @ApiProperty({ example: 'Điện: 4000/kWh, Nước: 100000/người', required: false })
  @IsString()
  @IsOptional()
  utilities?: string;

  @ApiProperty({ example: 'Không nuôi thú cưng, không làm ồn sau 23h', required: false })
  @IsString()
  @IsOptional()
  rules?: string;
}
