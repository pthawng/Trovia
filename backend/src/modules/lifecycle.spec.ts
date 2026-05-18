import { Test, TestingModule } from '@nestjs/testing';
import { RentalRequestsService } from './rental-requests/rental-requests.service';
import { ContractsService } from './contracts/contracts.service';
import { PaymentsService } from './payments/payments.service';
import { PrismaService } from '../database/prisma.service';
import {
  RentalRequestStatus,
  ContractStatus,
  PaymentStatus,
  TenancyStatus,
} from '@prisma/client';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

describe('Trovia Rental Lifecycle Integration & Authorization Auditing Tests', () => {
  let rentalRequestsService: RentalRequestsService;
  let contractsService: ContractsService;
  let paymentsService: PaymentsService;
  let prisma: PrismaService;

  // Mock Prisma methods
  const mockPrisma = {
    property: {
      findUnique: jest.fn(),
    },
    room: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    rentalRequest: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    conversation: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
    },
    message: {
      create: jest.fn(),
    },
    notification: {
      create: jest.fn(),
    },
    contract: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    payment: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    tenancy: {
      create: jest.fn(),
    },
    // Mock transaction
    $transaction: jest.fn((callback) => callback(mockPrisma)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RentalRequestsService,
        ContractsService,
        PaymentsService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    rentalRequestsService = module.get<RentalRequestsService>(
      RentalRequestsService,
    );
    contractsService = module.get<ContractsService>(ContractsService);
    paymentsService = module.get<PaymentsService>(PaymentsService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('1. Rental Request Creation Transaction & Validation', () => {
    it('should throw BadRequestException if tenant attempts to request their own property', async () => {
      mockPrisma.property.findUnique.mockResolvedValue({
        id: 'prop-1',
        landlordId: 'landlord-123',
        status: 'PUBLISHED',
      });

      await expect(
        rentalRequestsService.create('landlord-123', {
          propertyId: 'prop-1',
          moveInDate: '2026-06-01T00:00:00Z',
          rentalDurationMonths: 12,
          message: 'Hello',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should successfully create request + conversation + notification in transaction when valid', async () => {
      mockPrisma.property.findUnique.mockResolvedValue({
        id: 'prop-1',
        landlordId: 'landlord-123',
        status: 'PUBLISHED',
      });
      mockPrisma.rentalRequest.findFirst.mockResolvedValue(null);

      mockPrisma.rentalRequest.create.mockResolvedValue({
        id: 'request-123',
        tenantId: 'tenant-456',
        landlordId: 'landlord-123',
        propertyId: 'prop-1',
      });

      mockPrisma.conversation.create.mockResolvedValue({
        id: 'conv-123',
      });

      const result = await rentalRequestsService.create('tenant-456', {
        propertyId: 'prop-1',
        moveInDate: '2026-06-01T00:00:00Z',
        rentalDurationMonths: 12,
        message: 'Hello, I want to rent.',
      });

      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(mockPrisma.rentalRequest.create).toHaveBeenCalled();
      expect(mockPrisma.conversation.create).toHaveBeenCalled();
      expect(mockPrisma.notification.create).toHaveBeenCalled();
      expect(result.conversationId).toBe('conv-123');
    });
  });

  describe('2. Unauthorized Landlord Access', () => {
    it('should throw ForbiddenException if landlord attempts to approve/manage request for a property they do not own', async () => {
      mockPrisma.rentalRequest.findUnique.mockResolvedValue({
        id: 'request-123',
        landlordId: 'landlord-own',
        tenantId: 'tenant-456',
        property: { title: 'Nice house' },
      });

      await expect(
        rentalRequestsService.updateStatus(
          'request-123',
          'unauthorized-landlord',
          {
            status: RentalRequestStatus.ACCEPTED,
          },
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if landlord attempts to modify/send contract for a room they do not own', async () => {
      mockPrisma.contract.findUnique.mockResolvedValue({
        id: 'contract-123',
        landlordId: 'landlord-own',
      });

      await expect(
        contractsService.sendContract('contract-123', 'unauthorized-landlord'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('3. Contract Transition State Machine Checks', () => {
    it('should throw BadRequestException if trying to send a contract that is not in DRAFT status', async () => {
      mockPrisma.contract.findUnique.mockResolvedValue({
        id: 'contract-123',
        landlordId: 'landlord-own',
        status: ContractStatus.SENT,
        property: { title: 'Nice room' },
      });

      await expect(
        contractsService.sendContract('contract-123', 'landlord-own'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should successfully transition contract status from SENT to ACCEPTED on tenant acceptance', async () => {
      mockPrisma.contract.findUnique.mockResolvedValue({
        id: 'contract-123',
        tenantId: 'tenant-456',
        landlordId: 'landlord-own',
        status: ContractStatus.SENT,
        depositAmount: 5000000,
        conversationId: 'conv-123',
        property: { title: 'Nice Room' },
      });

      mockPrisma.contract.update.mockResolvedValue({
        id: 'contract-123',
        status: ContractStatus.ACCEPTED,
      });

      mockPrisma.payment.create.mockResolvedValue({
        id: 'payment-123',
      });

      const result = await contractsService.acceptContract(
        'contract-123',
        'tenant-456',
      );

      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(mockPrisma.contract.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'contract-123' },
          data: expect.objectContaining({ status: ContractStatus.ACCEPTED }),
        }),
      );
      expect(mockPrisma.payment.create).toHaveBeenCalled();
      expect(result.contract.status).toBe(ContractStatus.ACCEPTED);
    });
  });

  describe('4. Payment & Tenancy Activation Transaction', () => {
    it('should throw BadRequestException when trying to pay deposit for a contract that is not ACCEPTED', async () => {
      mockPrisma.payment.findUnique.mockResolvedValue({
        id: 'payment-123',
        type: 'DEPOSIT',
        status: PaymentStatus.PENDING,
        tenantId: 'tenant-456',
        landlordId: 'landlord-own',
        contractId: 'contract-123',
        contract: {
          id: 'contract-123',
          status: ContractStatus.DRAFT, // INVALID STATE FOR DEPOSIT PAYMENT
          roomId: 'room-123',
        },
      });

      mockPrisma.room.findUnique.mockResolvedValue({
        id: 'room-123',
        isAvailable: true,
      });

      await expect(
        paymentsService.markPaid('payment-123', 'tenant-456'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should successfully activate contract and create tenancy when deposit is marked paid', async () => {
      mockPrisma.payment.findUnique.mockResolvedValue({
        id: 'payment-123',
        type: 'DEPOSIT',
        amount: 5000000,
        status: PaymentStatus.PENDING,
        tenantId: 'tenant-456',
        landlordId: 'landlord-own',
        contractId: 'contract-123',
        contract: {
          id: 'contract-123',
          status: ContractStatus.ACCEPTED, // VALID
          roomId: 'room-123',
          property: { title: 'Luxury Apt' },
          conversationId: 'conv-123',
        },
      });

      mockPrisma.room.findUnique.mockResolvedValue({
        id: 'room-123',
        isAvailable: true, // VALID
      });

      mockPrisma.payment.update.mockResolvedValue({
        id: 'payment-123',
        status: PaymentStatus.PAID,
      });

      mockPrisma.contract.update.mockResolvedValue({
        id: 'contract-123',
        status: ContractStatus.ACTIVE,
      });

      mockPrisma.tenancy.create.mockResolvedValue({
        id: 'tenancy-123',
        status: TenancyStatus.ACTIVE,
      });

      const result = await paymentsService.markPaid(
        'payment-123',
        'tenant-456',
      );

      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(mockPrisma.payment.update).toHaveBeenCalled();
      expect(mockPrisma.contract.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'contract-123' },
          data: expect.objectContaining({ status: ContractStatus.ACTIVE }),
        }),
      );
      expect(mockPrisma.room.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'room-123' },
          data: { isAvailable: false },
        }),
      );
      expect(mockPrisma.tenancy.create).toHaveBeenCalled();
      expect(result.contractActivated).toBe(true);
    });
  });
});
