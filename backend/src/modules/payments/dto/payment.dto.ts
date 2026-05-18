import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsEnum, IsDateString } from 'class-validator';
import { PaymentType } from '@prisma/client';

export class CreatePaymentDto {
  @ApiProperty({ example: 5500000, description: 'Amount to pay' })
  @IsNumber()
  amount: number;

  @ApiProperty({ enum: PaymentType, example: PaymentType.MONTHLY_RENT })
  @IsEnum(PaymentType)
  type: PaymentType;

  @ApiProperty({
    example: '2026-06-01T00:00:00Z',
    description: 'Due date for invoice',
  })
  @IsDateString()
  dueDate: string;
}
