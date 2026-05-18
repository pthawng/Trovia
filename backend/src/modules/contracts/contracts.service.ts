import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateContractDto, UpdateContractDto } from './dto/contract.dto';
import { ContractStatus, RentalRequestStatus } from '@prisma/client';

@Injectable()
export class ContractsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(landlordId: string, dto: CreateContractDto) {
    const request = await this.prisma.rentalRequest.findUnique({
      where: { id: dto.rentalRequestId },
    });

    if (!request) {
      throw new NotFoundException('Yêu cầu thuê không tồn tại.');
    }

    // Rule 8: Landlord can create contract only after request is ACCEPTED
    if (request.status !== RentalRequestStatus.ACCEPTED) {
      throw new BadRequestException(
        'Bạn chỉ có thể tạo hợp đồng sau khi yêu cầu thuê đã được CHẤP NHẬN.',
      );
    }

    // Rule 9: Only landlord property owner can create/send contract
    if (request.landlordId !== landlordId) {
      throw new ForbiddenException(
        'Bạn không sở hữu yêu cầu thuê này để tiến hành tạo hợp đồng.',
      );
    }

    if (!request.roomId) {
      throw new BadRequestException(
        'Không thể lập hợp đồng thuê cho yêu cầu không có phòng cụ thể.',
      );
    }

    const conversation = await this.prisma.conversation.findFirst({
      where: { rentalRequestId: dto.rentalRequestId },
    });

    if (!conversation) {
      throw new NotFoundException(
        'Không tìm thấy cuộc trò chuyện liên kết với yêu cầu này.',
      );
    }

    return this.prisma.contract.create({
      data: {
        rentalRequestId: dto.rentalRequestId,
        conversationId: conversation.id,
        tenantId: request.tenantId,
        landlordId,
        propertyId: request.propertyId,
        roomId: request.roomId,
        status: ContractStatus.DRAFT,
        monthlyRent: dto.monthlyRent,
        depositAmount: dto.depositAmount,
        durationMonths: dto.durationMonths,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        terms: dto.terms,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.contract.findMany({
      where: {
        OR: [{ tenantId: userId }, { landlordId: userId }],
      },
      include: {
        property: {
          include: { images: true },
        },
        room: true,
        tenant: {
          select: { fullName: true, email: true, phone: true },
        },
        landlord: {
          select: { fullName: true, email: true, phone: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const contract = await this.prisma.contract.findUnique({
      where: { id },
      include: {
        property: {
          include: { images: true },
        },
        room: true,
        tenant: {
          select: { fullName: true, email: true, phone: true },
        },
        landlord: {
          select: { fullName: true, email: true, phone: true },
        },
        payments: true,
      },
    });

    if (!contract) {
      throw new NotFoundException('Hợp đồng không tồn tại.');
    }

    if (contract.tenantId !== userId && contract.landlordId !== userId) {
      throw new ForbiddenException('Bạn không có quyền truy cập hợp đồng này.');
    }

    return contract;
  }

  async update(id: string, landlordId: string, dto: UpdateContractDto) {
    const contract = await this.prisma.contract.findUnique({
      where: { id },
    });

    if (!contract) {
      throw new NotFoundException('Hợp đồng không tồn tại.');
    }

    if (contract.landlordId !== landlordId) {
      throw new ForbiddenException(
        'Chỉ chủ nhà sở hữu mới có quyền sửa đổi nháp hợp đồng.',
      );
    }

    if (contract.status !== ContractStatus.DRAFT) {
      throw new BadRequestException(
        'Chỉ có thể sửa đổi khi hợp đồng đang ở trạng thái Nháp (DRAFT).',
      );
    }

    return this.prisma.contract.update({
      where: { id },
      data: {
        monthlyRent:
          dto.monthlyRent !== undefined ? dto.monthlyRent : undefined,
        depositAmount:
          dto.depositAmount !== undefined ? dto.depositAmount : undefined,
        durationMonths:
          dto.durationMonths !== undefined ? dto.durationMonths : undefined,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        terms: dto.terms !== undefined ? dto.terms : undefined,
      },
    });
  }

  async sendContract(id: string, landlordId: string) {
    const contract = await this.prisma.contract.findUnique({
      where: { id },
      include: { property: true },
    });

    if (!contract) {
      throw new NotFoundException('Hợp đồng không tồn tại.');
    }

    if (contract.landlordId !== landlordId) {
      throw new ForbiddenException(
        'Chỉ chủ nhà sở hữu mới có quyền gửi hợp đồng.',
      );
    }

    if (contract.status !== ContractStatus.DRAFT) {
      throw new BadRequestException(
        'Hợp đồng đã gửi hoặc không nằm ở trạng thái Nháp.',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.contract.update({
        where: { id },
        data: {
          status: ContractStatus.SENT,
          sentAt: new Date(),
        },
      });

      // Send chat message representing the contract draft
      await tx.message.create({
        data: {
          conversationId: contract.conversationId,
          senderId: landlordId,
          type: 'CONTRACT',
          content: `Chủ nhà đã soạn thảo và gửi hợp đồng thuê phòng cho căn hộ ${contract.property.title}. Vui lòng xác nhận ký.`,
          metadata: JSON.stringify({
            contractId: contract.id,
            monthlyRent: Number(contract.monthlyRent),
            depositAmount: Number(contract.depositAmount),
            durationMonths: contract.durationMonths,
            status: ContractStatus.SENT,
          }),
        },
      });

      // Create notification for tenant
      await tx.notification.create({
        data: {
          userId: contract.tenantId,
          type: 'CONTRACT_SENT',
          title: 'Hợp đồng thuê phòng mới đang chờ ký',
          body: `Chủ nhà đã gửi dự thảo hợp đồng thuê cho ${contract.property.title}. Vui lòng đọc kỹ điều khoản và ấn ký.`,
          metadata: JSON.stringify({
            contractId: contract.id,
            conversationId: contract.conversationId,
          }),
        },
      });

      return updated;
    });
  }

  async acceptContract(id: string, tenantId: string) {
    const contract = await this.prisma.contract.findUnique({
      where: { id },
      include: { property: true },
    });

    if (!contract) {
      throw new NotFoundException('Hợp đồng không tồn tại.');
    }

    // Rule 10: Tenant can only accept contract assigned to them
    if (contract.tenantId !== tenantId) {
      throw new ForbiddenException(
        'Bạn không phải là người thuê được chỉ định để ký hợp đồng này.',
      );
    }

    if (contract.status !== ContractStatus.SENT) {
      throw new BadRequestException(
        'Hợp đồng này không ở trạng thái Đang chờ ký (SENT).',
      );
    }

    // Rule 11: When tenant accepts contract
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.contract.update({
        where: { id },
        data: {
          status: ContractStatus.ACCEPTED,
          acceptedAt: new Date(),
        },
      });

      // Create required deposit payment as PENDING
      const payment = await tx.payment.create({
        data: {
          contractId: contract.id,
          tenantId: contract.tenantId,
          landlordId: contract.landlordId,
          amount: contract.depositAmount,
          type: 'DEPOSIT',
          status: 'PENDING',
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Due in 3 days
        },
      });

      // Add system message
      await tx.message.create({
        data: {
          conversationId: contract.conversationId,
          senderId: tenantId,
          type: 'SYSTEM',
          content:
            'Người thuê đã hoàn tất KÝ chấp nhận hợp đồng. Khoản thanh toán Đặt cọc phòng đang được chờ hoàn tất.',
          metadata: JSON.stringify({
            contractId: contract.id,
            paymentId: payment.id,
          }),
        },
      });

      // Create notification for landlord
      await tx.notification.create({
        data: {
          userId: contract.landlordId,
          type: 'CONTRACT_ACCEPTED',
          title: 'Hợp đồng thuê đã được ký chấp nhận',
          body: `Người thuê đã đồng ý và KÝ hợp đồng cho ${contract.property.title}. Vui lòng chờ họ hoàn tất thanh toán cọc phòng.`,
          metadata: JSON.stringify({
            contractId: contract.id,
            paymentId: payment.id,
          }),
        },
      });

      return { contract: updated, payment };
    });
  }

  async rejectContract(id: string, tenantId: string) {
    const contract = await this.prisma.contract.findUnique({
      where: { id },
      include: { property: true },
    });

    if (!contract) {
      throw new NotFoundException('Hợp đồng không tồn tại.');
    }

    if (contract.tenantId !== tenantId) {
      throw new ForbiddenException(
        'Bạn không phải là người thuê được chỉ định để thực hiện thao tác.',
      );
    }

    if (contract.status !== ContractStatus.SENT) {
      throw new BadRequestException(
        'Hợp đồng này không ở trạng thái Đang chờ ký (SENT).',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.contract.update({
        where: { id },
        data: {
          status: ContractStatus.REJECTED,
        },
      });

      // Add system message in conversation
      await tx.message.create({
        data: {
          conversationId: contract.conversationId,
          senderId: tenantId,
          type: 'SYSTEM',
          content:
            'Người thuê đã TỪ CHỐI điều khoản trong dự thảo hợp đồng thuê nhà.',
          metadata: JSON.stringify({ contractId: contract.id }),
        },
      });

      // Notify landlord
      await tx.notification.create({
        data: {
          userId: contract.landlordId,
          type: 'CONTRACT_REJECTED',
          title: 'Hợp đồng bị từ chối ký',
          body: `Người thuê đã TỪ CHỐI ký dự thảo hợp đồng cho ${contract.property.title}.`,
          metadata: JSON.stringify({ contractId: contract.id }),
        },
      });

      return updated;
    });
  }
}
