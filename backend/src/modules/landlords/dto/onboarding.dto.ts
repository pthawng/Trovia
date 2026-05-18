import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsInt, Min, Max } from 'class-validator';

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

  @ApiProperty({ example: 'Chủ nhà Phương Thảo', required: false })
  @IsString()
  @IsOptional()
  publicName?: string;

  @ApiProperty({ example: 'support@trovia.vn', required: false })
  @IsOptional()
  supportEmail?: string;

  @ApiProperty({ example: '0988776655', required: false })
  @IsString()
  @IsOptional()
  contactPhone?: string;

  @ApiProperty({ example: 'https://example.com/logo.jpg', required: false })
  @IsString()
  @IsOptional()
  logoUrl?: string;

  @ApiProperty({ example: 'Vietcombank', required: false })
  @IsString()
  @IsOptional()
  bankName?: string;

  @ApiProperty({ example: '1029384756', required: false })
  @IsString()
  @IsOptional()
  bankAccountNumber?: string;

  @ApiProperty({ example: 'NGUYEN VAN THAO', required: false })
  @IsString()
  @IsOptional()
  bankAccountHolder?: string;

  @ApiProperty({ example: 'Chuyển khoản tiền phòng {room}', required: false })
  @IsString()
  @IsOptional()
  vietQrNoteTemplate?: string;

  @ApiProperty({ example: 2, required: false })
  @IsInt()
  @Min(0)
  @Max(12)
  @IsOptional()
  defaultDepositMonths?: number;

  @ApiProperty({ example: 12, required: false })
  @IsInt()
  @Min(1)
  @Max(60)
  @IsOptional()
  defaultContractDurationMonths?: number;

  @ApiProperty({ example: 5, required: false })
  @IsInt()
  @Min(1)
  @Max(31)
  @IsOptional()
  defaultPaymentDueDay?: number;

  @ApiProperty({ example: 'Không làm ồn sau 22h, giữ gìn vệ sinh chung...', required: false })
  @IsString()
  @IsOptional()
  defaultHouseRules?: string;

  @ApiProperty({ example: { newRequest: true, message: true }, required: false })
  @IsOptional()
  notificationPreferences?: any;

  @ApiProperty({ example: { autoPublish: false, defaultStatus: 'DRAFT' }, required: false })
  @IsOptional()
  publishingPreferences?: any;
}
