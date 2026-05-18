import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'tenant@trovia.vn',
    description: 'User email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'trovia_secure_pass', description: 'User password' })
  @IsString()
  @MinLength(6)
  password: string;
}
