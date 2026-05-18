import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  CreateViewingAppointmentDto,
  UpdateViewingStatusDto,
} from './dto/viewing-appointment.dto';
import { ViewingAppointmentStatus } from '@prisma/client';

@Injectable()
export class ViewingAppointmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    conversationId: string,
    landlordId: string,
    dto: CreateViewingAppointmentDto,
  ) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Cuộc hội thoại không tồn tại.');
    }

    // Rule 6: Landlord can create viewing appointment inside conversation
    if (conversation.landlordId !== landlordId) {
      throw new ForbiddenException(
        'Chỉ chủ nhà của cuộc hội thoại này mới có thể tạo lịch hẹn.',
      );
    }

    if (!conversation.rentalRequestId) {
      throw new BadRequestException(
        'Cuộc hội thoại này không gắn với yêu cầu thuê nào.',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const appointment = await tx.viewingAppointment.create({
        data: {
          conversationId,
          rentalRequestId: conversation.rentalRequestId!,
          propertyId: conversation.propertyId!,
          tenantId: conversation.tenantId,
          landlordId,
          scheduledAt: new Date(dto.scheduledAt),
          location: dto.location,
          note: dto.note || null,
          status: ViewingAppointmentStatus.PENDING,
        },
      });

      // Send APPOINTMENT type message in chat room
      await tx.message.create({
        data: {
          conversationId,
          senderId: landlordId,
          type: 'APPOINTMENT',
          content: `Lịch hẹn xem nhà: ${dto.location} vào lúc ${new Date(dto.scheduledAt).toLocaleString('vi-VN')}`,
          metadata: JSON.stringify({
            appointmentId: appointment.id,
            scheduledAt: appointment.scheduledAt,
            location: appointment.location,
            note: appointment.note,
            status: ViewingAppointmentStatus.PENDING,
          }),
        },
      });

      // Notify tenant
      await tx.notification.create({
        data: {
          userId: conversation.tenantId,
          type: 'APPOINTMENT_CREATED',
          title: 'Lịch hẹn xem nhà mới',
          body: `Chủ nhà đã lên lịch hẹn xem nhà vào lúc ${new Date(dto.scheduledAt).toLocaleString('vi-VN')}.`,
          metadata: JSON.stringify({
            appointmentId: appointment.id,
            conversationId,
          }),
        },
      });

      return appointment;
    });
  }

  async updateStatus(id: string, userId: string, dto: UpdateViewingStatusDto) {
    const appointment = await this.prisma.viewingAppointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      throw new NotFoundException('Lịch hẹn không tồn tại.');
    }

    // Rule 7: Tenant can confirm or decline (cancel) appointment
    if (
      dto.status === ViewingAppointmentStatus.CONFIRMED &&
      appointment.tenantId !== userId
    ) {
      throw new ForbiddenException(
        'Chỉ người thuê mới có thể xác nhận lịch hẹn này.',
      );
    }

    if (appointment.tenantId !== userId && appointment.landlordId !== userId) {
      throw new ForbiddenException('Bạn không có quyền sửa đổi lịch hẹn này.');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.viewingAppointment.update({
        where: { id },
        data: { status: dto.status },
      });

      // Send system message in chat
      let msgContent = `Lịch hẹn đã được cập nhật: ${dto.status}`;
      if (dto.status === ViewingAppointmentStatus.CONFIRMED) {
        msgContent = 'Người thuê ĐÃ XÁC NHẬN lịch hẹn xem phòng.';
      } else if (dto.status === ViewingAppointmentStatus.CANCELLED) {
        msgContent = 'Lịch hẹn xem phòng ĐÃ BỊ HỦY.';
      } else if (dto.status === ViewingAppointmentStatus.COMPLETED) {
        msgContent = 'Cuộc xem phòng đã HOÀN THÀNH thành công.';
      }

      await tx.message.create({
        data: {
          conversationId: appointment.conversationId,
          senderId: userId,
          type: 'SYSTEM',
          content: msgContent,
          metadata: JSON.stringify({ appointmentId: id, status: dto.status }),
        },
      });

      // Notify other participant
      const receiverId =
        appointment.tenantId === userId
          ? appointment.landlordId
          : appointment.tenantId;
      await tx.notification.create({
        data: {
          userId: receiverId,
          type: 'APPOINTMENT_UPDATED',
          title: 'Cập nhật cuộc hẹn xem phòng',
          body: msgContent,
          metadata: JSON.stringify({ appointmentId: id, status: dto.status }),
        },
      });

      return updated;
    });
  }
}
