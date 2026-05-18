import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

// ── Existing DTOs ─────────────────────────────────────────────────────────────

export class ForgotPasswordDto {
  @ApiProperty({ example: 'tenant@trovia.vn' })
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({ description: 'Raw reset token from email link' })
  @IsString()
  token: string;

  @ApiProperty({ example: 'new_secure_password' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  newPassword: string;
}

export class VerifyEmailDto {
  @ApiProperty({ description: 'Raw verification token from email link' })
  @IsString()
  token: string;
}

export class ResendVerificationDto {
  @ApiProperty({ example: 'tenant@trovia.vn' })
  @IsEmail()
  @IsOptional()
  email?: string;
}
