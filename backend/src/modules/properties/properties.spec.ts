import { Test, TestingModule } from '@nestjs/testing';
import { PropertiesService } from './properties.service';
import { RolesService } from '../roles/roles.service';
import { PrismaService } from '../../database/prisma.service';
import { PropertyStatus } from '@prisma/client';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

describe('PropertiesService Business Rules Auditing', () => {
  let service: PropertiesService;
  let rolesService: RolesService;
  let prisma: PrismaService;

  const mockPrisma = {
    property: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrisma)),
  };

  const mockRolesService = {
    checkLandlordActive: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertiesService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
        {
          provide: RolesService,
          useValue: mockRolesService,
        },
      ],
    }).compile();

    service = module.get<PropertiesService>(PropertiesService);
    rolesService = module.get<RolesService>(RolesService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('1. Landlord Active Check', () => {
    it('should throw ForbiddenException if landlord is not active', async () => {
      mockRolesService.checkLandlordActive.mockRejectedValue(
        new ForbiddenException('Landlord capability is not active'),
      );

      await expect(service.publish('prop-1', 'landlord-1')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('2. Ownership Validation', () => {
    it('should throw ForbiddenException if a landlord tries to publish another landlord\'s property', async () => {
      mockRolesService.checkLandlordActive.mockResolvedValue(true);
      mockPrisma.property.findUnique.mockResolvedValue({
        id: 'prop-1',
        landlordId: 'landlord-2', // DIFFERENT
        status: PropertyStatus.DRAFT,
        deletedAt: null,
        rooms: [],
        images: [],
        propertyAmenities: [],
      });

      await expect(service.publish('prop-1', 'landlord-1')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('3. Required Content Validation before Publishing', () => {
    it('should throw BadRequestException if property does not have address details', async () => {
      mockRolesService.checkLandlordActive.mockResolvedValue(true);
      mockPrisma.property.findUnique.mockResolvedValue({
        id: 'prop-1',
        landlordId: 'landlord-1',
        status: PropertyStatus.DRAFT,
        deletedAt: null,
        address: '', // MISSING
        city: '',
        district: '',
        rooms: [{ id: 'room-1', isAvailable: true, status: 'AVAILABLE' }],
        images: [{ id: 'img-1' }],
        propertyAmenities: [{ id: 'amenity-1' }],
      });

      await expect(service.publish('prop-1', 'landlord-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if property has zero images', async () => {
      mockRolesService.checkLandlordActive.mockResolvedValue(true);
      mockPrisma.property.findUnique.mockResolvedValue({
        id: 'prop-1',
        landlordId: 'landlord-1',
        status: PropertyStatus.DRAFT,
        deletedAt: null,
        address: '123 Test St',
        city: 'HCMC',
        district: 'Binh Thanh',
        rooms: [{ id: 'room-1', isAvailable: true, status: 'AVAILABLE' }],
        images: [], // EMPTY
        propertyAmenities: [{ id: 'amenity-1' }],
      });

      await expect(service.publish('prop-1', 'landlord-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if property has zero amenities', async () => {
      mockRolesService.checkLandlordActive.mockResolvedValue(true);
      mockPrisma.property.findUnique.mockResolvedValue({
        id: 'prop-1',
        landlordId: 'landlord-1',
        status: PropertyStatus.DRAFT,
        deletedAt: null,
        address: '123 Test St',
        city: 'HCMC',
        district: 'Binh Thanh',
        rooms: [{ id: 'room-1', isAvailable: true, status: 'AVAILABLE' }],
        images: [{ id: 'img-1' }],
        propertyAmenities: [], // EMPTY
      });

      await expect(service.publish('prop-1', 'landlord-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if property has zero rooms/units', async () => {
      mockRolesService.checkLandlordActive.mockResolvedValue(true);
      mockPrisma.property.findUnique.mockResolvedValue({
        id: 'prop-1',
        landlordId: 'landlord-1',
        status: PropertyStatus.DRAFT,
        deletedAt: null,
        address: '123 Test St',
        city: 'HCMC',
        district: 'Binh Thanh',
        rooms: [], // EMPTY
        images: [{ id: 'img-1' }],
        propertyAmenities: [{ id: 'amenity-1' }],
      });

      await expect(service.publish('prop-1', 'landlord-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if property has no available rooms', async () => {
      mockRolesService.checkLandlordActive.mockResolvedValue(true);
      mockPrisma.property.findUnique.mockResolvedValue({
        id: 'prop-1',
        landlordId: 'landlord-1',
        status: PropertyStatus.DRAFT,
        deletedAt: null,
        address: '123 Test St',
        city: 'HCMC',
        district: 'Binh Thanh',
        rooms: [{ id: 'room-1', isAvailable: false, status: 'OCCUPIED' }], // NOT AVAILABLE
        images: [{ id: 'img-1' }],
        propertyAmenities: [{ id: 'amenity-1' }],
      });

      await expect(service.publish('prop-1', 'landlord-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('4. Successful Publish State Transition', () => {
    it('should set status to PUBLISHED when all validation rules are successfully satisfied', async () => {
      mockRolesService.checkLandlordActive.mockResolvedValue(true);
      mockPrisma.property.findUnique.mockResolvedValue({
        id: 'prop-1',
        landlordId: 'landlord-1',
        status: PropertyStatus.DRAFT,
        deletedAt: null,
        address: '123 Test St',
        city: 'HCMC',
        district: 'Binh Thanh',
        rooms: [{ id: 'room-1', isAvailable: true, status: 'AVAILABLE' }],
        images: [{ id: 'img-1', url: 'img.png' }],
        propertyAmenities: [{ id: 'amenity-1' }],
      });

      mockPrisma.property.update.mockResolvedValue({
        id: 'prop-1',
        status: PropertyStatus.PUBLISHED,
      });

      const result = await service.publish('prop-1', 'landlord-1');

      expect(mockPrisma.property.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'prop-1' },
          data: { status: PropertyStatus.PUBLISHED },
        }),
      );
      expect(result.status).toBe(PropertyStatus.PUBLISHED);
    });
  });
});
