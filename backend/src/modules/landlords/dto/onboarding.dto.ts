import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional } from 'class-validator';

export class StartOnboardingDto {
  @ApiProperty({
    example: 'Trovia Rentals Co.',
    description: 'Business or trade name',
  })
  @IsString()
  businessName: string;

  @ApiProperty({
    example: '123 Điện Biên Phủ, Bình Thạnh, HCMC',
    description: 'Business address',
  })
  @IsString()
  businessAddress: string;

  @ApiProperty({
    example: 'rentals@trovia.vn',
    description: 'Business contact email',
  })
  @IsEmail()
  businessEmail: string;

  @ApiProperty({ example: '0901234567', description: 'Business contact phone' })
  @IsString()
  businessPhone: string;

  @ApiProperty({
    example: '079099001234',
    description: 'Identity Card Number (CCCD)',
  })
  @IsString()
  identityCardNumber: string;

  @ApiProperty({
    example: 'https://example.com/front.jpg',
    description: 'ID card front photo url',
  })
  @IsString()
  identityCardFrontUrl: string;

  @ApiProperty({
    example: 'https://example.com/back.jpg',
    description: 'ID card back photo url',
  })
  @IsString()
  identityCardBackUrl: string;
}

export class UpdateLandlordDto {
  @ApiProperty({ example: 'Trovia Rentals Co.', required: false })
  @IsString()
  @IsOptional()
  businessName?: string;

  @ApiProperty({ example: '123 Điện Biên Phủ, HCMC', required: false })
  @IsString()
  @IsOptional()
  businessAddress?: string;

  @ApiProperty({ example: 'rentals@trovia.vn', required: false })
  @IsEmail()
  @IsOptional()
  businessEmail?: string;

  @ApiProperty({ example: '0901234567', required: false })
  @IsString()
  @IsOptional()
  businessPhone?: string;
}
