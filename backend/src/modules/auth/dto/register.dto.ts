import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'tenant@trovia.vn',
    description: 'User email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'trovia_secure_pass',
    description: 'User password (min 6 chars)',
  })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @ApiProperty({ example: 'Nguyễn Văn A', description: 'Full name' })
  @IsString()
  fullName: string;

  @ApiProperty({
    example: '0987654321',
    description: 'Phone number',
    required: false,
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    example: 'Hồ Chí Minh',
    description: 'City name',
    required: false,
  })
  @IsString()
  @IsOptional()
  city?: string;
}
