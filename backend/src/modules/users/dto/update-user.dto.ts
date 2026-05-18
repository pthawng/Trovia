import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    example: 'Nguyễn Văn B',
    description: 'Updated full name',
    required: false,
  })
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiProperty({
    example: 'https://example.com/avatar.jpg',
    description: 'Avatar URL',
    required: false,
  })
  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @ApiProperty({
    example: '0912345678',
    description: 'Phone number',
    required: false,
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    example: 'Đà Nẵng',
    description: 'City location',
    required: false,
  })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({
    example: 'Kỹ sư phần mềm',
    description: 'Nghề nghiệp',
    required: false,
  })
  @IsString()
  @IsOptional()
  occupation?: string;

  @ApiProperty({
    example: '1995-10-25',
    description: 'Ngày sinh',
    required: false,
  })
  @IsString()
  @IsOptional()
  dateOfBirth?: string;

  @ApiProperty({
    example: 'Tôi thích phòng yên tĩnh, sạch sẽ...',
    description: 'Mô tả cá nhân ngắn',
    required: false,
  })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiProperty({
    example: 'Quận Cầu Giấy',
    description: 'Quận mong muốn thuê',
    required: false,
  })
  @IsString()
  @IsOptional()
  preferredDistrict?: string;

  @ApiProperty({
    example: '3tr - 5tr',
    description: 'Khoảng ngân sách',
    required: false,
  })
  @IsString()
  @IsOptional()
  budgetRange?: string;

  @ApiProperty({
    example: 'Đầu tháng tới',
    description: 'Thời gian chuyển vào mong muốn',
    required: false,
  })
  @IsString()
  @IsOptional()
  moveInTimeline?: string;

  @ApiProperty({
    example: 'STUDENT',
    description: 'Renter type role',
    enum: ['STUDENT', 'OFFICE_WORKER', 'FREELANCER', 'FAMILY', 'OTHER'],
    required: false,
  })
  @IsString()
  @IsOptional()
  renterType?: string;

  @ApiProperty({
    example: 3000000,
    description: 'Minimum budget range',
    required: false,
  })
  @IsOptional()
  budgetMin?: number;

  @ApiProperty({
    example: 5000000,
    description: 'Maximum budget range',
    required: false,
  })
  @IsOptional()
  budgetMax?: number;

  @ApiProperty({
    example: '2026-06-01',
    description: 'Expected move-in date',
    required: false,
  })
  @IsString()
  @IsOptional()
  expectedMoveInDate?: string;
}
