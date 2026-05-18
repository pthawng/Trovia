import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsArray, IsUUID } from 'class-validator';
import { MaintenancePriority, MaintenanceStatus } from '@prisma/client';

export class CreateMaintenanceDto {
  @ApiProperty({ example: 'Hỏng vòi nước nhà vệ sinh' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Vòi nước bị rò rỉ liên tục từ tối qua, cần sửa gấp.' })
  @IsString()
  description: string;

  @ApiProperty({ example: '4a6b2c8f-3d12-4c9b-9876-123456789abc' })
  @IsUUID()
  propertyId: string;

  @ApiProperty({ example: '8c9b2d7e-4a12-4c9b-9876-123456789def', required: false })
  @IsUUID()
  @IsOptional()
  roomId?: string;

  @ApiProperty({ enum: MaintenancePriority, example: MaintenancePriority.MEDIUM, required: false })
  @IsEnum(MaintenancePriority)
  @IsOptional()
  priority?: MaintenancePriority;

  @ApiProperty({ example: [], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];
}

export class UpdateMaintenanceStatusDto {
  @ApiProperty({ enum: MaintenanceStatus, example: MaintenanceStatus.IN_PROGRESS })
  @IsEnum(MaintenanceStatus)
  status: MaintenanceStatus;
}

export class UpdateMaintenanceDto {
  @ApiProperty({ enum: MaintenanceStatus, example: MaintenanceStatus.IN_PROGRESS, required: false })
  @IsEnum(MaintenanceStatus)
  @IsOptional()
  status?: MaintenanceStatus;

  @ApiProperty({ example: 'Nguyễn Văn A - Thợ Điện', required: false })
  @IsString()
  @IsOptional()
  assignedTo?: string;

  @ApiProperty({ example: 'Đã gọi thợ đến sửa vào chiều mai.', required: false })
  @IsString()
  @IsOptional()
  comment?: string;
}
