import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreatePaymentDto } from './dto/payment.dto';
import { PaymentStatus, ContractStatus, TenancyStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async createPaymentForContract(
    contractId: string,
    landlordId: string,
    dto: CreatePaymentDto,
  ) {
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
    });

    if (!contract) {
      throw new NotFoundException('Hợp đồng không tồn tại.');
    }

    if (contract.landlordId !== landlordId) {
      throw new ForbiddenException(
        'Chỉ chủ nhà của hợp đồng này mới có quyền lập hóa đơn thanh toán.',
      );
    }

    return this.prisma.payment.create({
      data: {
        contractId,
        tenantId: contract.tenantId,
        landlordId,
        amount: dto.amount,
        type: dto.type,
        status: PaymentStatus.PENDING,
        dueDate: new Date(dto.dueDate),
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.payment.findMany({
      where: {
        OR: [{ tenantId: userId }, { landlordId: userId }],
      },
      include: {
        contract: {
          include: {
            property: {
              include: { images: true },
            },
            room: true,
          },
        },
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  async findOne(id: string, userId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        contract: {
          include: {
            property: {
              include: { images: true },
            },
            room: true,
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Hóa đơn thanh toán không tồn tại.');
    }

    if (payment.tenantId !== userId && payment.landlordId !== userId) {
      throw new ForbiddenException(
        'Bạn không có quyền truy cập hóa đơn thanh toán này.',
      );
    }

    return payment;
  }

  async markPaid(id: string, userId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        contract: {
          include: {
            property: true,
            room: true,
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Hóa đơn thanh toán không tồn tại.');
    }

    if (payment.tenantId !== userId && payment.landlordId !== userId) {
      throw new ForbiddenException(
        'Bạn không có quyền thao tác trên hóa đơn thanh toán này.',
      );
    }

    if (payment.status === PaymentStatus.PAID) {
      throw new BadRequestException('Hóa đơn này đã được thanh toán từ trước.');
    }

    // Run transaction for Payment marking paid, Contract activation, Room occupancy status, and Tenancy creation
    return this.prisma.$transaction(async (tx) => {
      // 1. Fetch Room inside transaction to check occupancy & prevent double tenancy
      const room = await tx.room.findUnique({
        where: { id: payment.contract.roomId },
      });

      if (!room) {
        throw new NotFoundException('Phòng trọ không tồn tại.');
      }

      // State machine validation: Check if contract is in valid state for payment type
      if (payment.type === 'DEPOSIT') {
        if (payment.contract.status !== ContractStatus.ACCEPTED) {
          throw new BadRequestException(
            `Không thể thanh toán đặt cọc. Hợp đồng liên kết phải ở trạng thái đã ký chấp nhận (ACCEPTED), trạng thái hiện tại: ${payment.contract.status}.`,
          );
        }
      } else {
        if (payment.contract.status !== ContractStatus.ACTIVE) {
          throw new BadRequestException(
            `Không thể thanh toán hóa đơn. Hợp đồng liên kết phải ở trạng thái đang hoạt động (ACTIVE), trạng thái hiện tại: ${payment.contract.status}.`,
          );
        }
      }

      // Rule 14: Prevent double tenancy for same occupied room
      if (
        (payment.type === 'DEPOSIT' || payment.type === 'FIRST_MONTH_RENT') &&
        !room.isAvailable
      ) {
        throw new BadRequestException(
          'Không thể kích hoạt hợp đồng. Phòng trọ này đã có người thuê và đang được khóa.',
        );
      }

      // 2. Mark Payment as PAID
      const updatedPayment = await tx.payment.update({
        where: { id },
        data: {
          status: PaymentStatus.PAID,
          paidAt: new Date(),
          providerTransactionId: `MANUAL_TR_${Date.now()}`,
        },
      });

      let contractActivated = false;
      let tenancy: any = null;

      // 3. If the payment is a DEPOSIT, activate contract, set room unavailable, create a Tenancy
      if (payment.type === 'DEPOSIT') {
        // Activate Contract
        await tx.contract.update({
          where: { id: payment.contractId },
          data: {
            status: ContractStatus.ACTIVE,
            activatedAt: new Date(),
          },
        });
        contractActivated = true;

        // Make Room Unavailable (Occupied)
        await tx.room.update({
          where: { id: payment.contract.roomId },
          data: {
            isAvailable: false,
          },
        });

        // Create Active Tenancy
        tenancy = await tx.tenancy.create({
          data: {
            contractId: payment.contractId,
            tenantId: payment.tenantId,
            landlordId: payment.landlordId,
            propertyId: payment.contract.propertyId,
            roomId: payment.contract.roomId,
            status: TenancyStatus.ACTIVE,
            startedAt: new Date(),
          },
        });

        // Log system message in conversation
        await tx.message.create({
          data: {
            conversationId: payment.contract.conversationId,
            senderId: payment.landlordId,
            type: 'SYSTEM',
            content:
              'Giao dịch đặt cọc hoàn tất! Hợp đồng chính thức có hiệu lực và lịch trình lưu trú bắt đầu.',
            metadata: JSON.stringify({
              contractId: payment.contractId,
              paymentId: payment.id,
            }),
          },
        });

        // Notify tenant
        await tx.notification.create({
          data: {
            userId: payment.tenantId,
            type: 'CONTRACT_ACTIVATED',
            title: 'Hợp đồng thuê phòng ĐÃ HIỆU LỰC 🎉',
            body: `Khoản đặt cọc căn hộ ${payment.contract.property.title} đã thanh toán thành công. Hợp đồng của bạn đã được KÍCH HOẠT.`,
            metadata: JSON.stringify({
              contractId: payment.contractId,
              paymentId: payment.id,
            }),
          },
        });

        // Notify landlord
        await tx.notification.create({
          data: {
            userId: payment.landlordId,
            type: 'CONTRACT_ACTIVATED_LANDLORD',
            title: 'Nhận cọc thành công - Kích hoạt lưu trú',
            body: `Người thuê đã thanh toán khoản cọc ${Number(payment.amount).toLocaleString('vi-VN')} VND. Căn phòng hiện được khóa và hợp đồng đã kích hoạt.`,
            metadata: JSON.stringify({
              contractId: payment.contractId,
              paymentId: payment.id,
            }),
          },
        });
      } else {
        // Just record generic payment system log
        await tx.message.create({
          data: {
            conversationId: payment.contract.conversationId,
            senderId: payment.landlordId,
            type: 'SYSTEM',
            content: `Thanh toán thành công hóa đơn ${payment.type} số tiền ${Number(payment.amount).toLocaleString('vi-VN')} VND.`,
            metadata: JSON.stringify({
              contractId: payment.contractId,
              paymentId: payment.id,
            }),
          },
        });

        // Notify tenant
        await tx.notification.create({
          data: {
            userId: payment.tenantId,
            type: 'BILL_PAID',
            title: 'Thanh toán hóa đơn thành công',
            body: `Hóa đơn ${payment.type} của bạn đã được đánh dấu là thanh toán thành công.`,
            metadata: JSON.stringify({ paymentId: payment.id }),
          },
        });
      }

      return { payment: updatedPayment, contractActivated, tenancy };
    });
  }
}
