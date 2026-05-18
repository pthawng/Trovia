import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsInt, Min, Max, IsString, IsNotEmpty } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({ example: '8fd23c13-3b81-4f71-ad10-b741e3da06b7' })
  @IsUUID()
  @IsNotEmpty()
  tenancyId: string;

  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ example: 'Chủ nhà rất nhiệt tình, hỗ trợ sửa chữa nhanh chóng.' })
  @IsString()
  @IsNotEmpty()
  comment: string;
}
