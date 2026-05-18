import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { StartOnboardingDto, UpdateLandlordDto } from './dto/onboarding.dto';
import { LandlordStatus, AppRole } from '@prisma/client';
import { RolesService } from '../roles/roles.service';

@Injectable()
export class LandlordsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rolesService: RolesService,
  ) {}

  async startOnboarding(userId: string, dto: StartOnboardingDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Upsert landlord profile
    const profile = await this.prisma.landlordProfile.upsert({
      where: { userId },
      update: {
        status: LandlordStatus.PENDING_VERIFICATION,
        businessName: dto.businessName,
        businessAddress: dto.businessAddress,
        businessEmail: dto.businessEmail,
        businessPhone: dto.businessPhone,
        identityCardNumber: dto.identityCardNumber,
        identityCardFrontUrl: dto.identityCardFrontUrl,
        identityCardBackUrl: dto.identityCardBackUrl,
      },
      create: {
        userId,
        status: LandlordStatus.PENDING_VERIFICATION,
        businessName: dto.businessName,
        businessAddress: dto.businessAddress,
        businessEmail: dto.businessEmail,
        businessPhone: dto.businessPhone,
        identityCardNumber: dto.identityCardNumber,
        identityCardFrontUrl: dto.identityCardFrontUrl,
        identityCardBackUrl: dto.identityCardBackUrl,
      },
    });

    return profile;
  }

  async getMe(userId: string) {
    const profile = await this.prisma.landlordProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException(
        'Landlord profile not found. Please start onboarding.',
      );
    }

    return profile;
  }

  async updateMe(userId: string, dto: UpdateLandlordDto) {
    const profile = await this.prisma.landlordProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Landlord profile not found');
    }

    return this.prisma.landlordProfile.update({
      where: { userId },
      data: {
        businessName:
          dto.businessName !== undefined
            ? dto.businessName
            : profile.businessName,
        businessAddress:
          dto.businessAddress !== undefined
            ? dto.businessAddress
            : profile.businessAddress,
        businessEmail:
          dto.businessEmail !== undefined
            ? dto.businessEmail
            : profile.businessEmail,
        businessPhone:
          dto.businessPhone !== undefined
            ? dto.businessPhone
            : profile.businessPhone,
      },
    });
  }

  async activate(userId: string, targetUserId?: string) {
    // If targetUserId is provided, it must be performed by admin.
    // If not, it self-activates for ease of testing in this sandbox app.
    const finalUserId = targetUserId || userId;

    const profile = await this.prisma.landlordProfile.findUnique({
      where: { userId: finalUserId },
    });

    if (!profile) {
      throw new NotFoundException('Landlord profile not found to activate');
    }

    const updatedProfile = await this.prisma.landlordProfile.update({
      where: { userId: finalUserId },
      data: {
        status: LandlordStatus.ACTIVE,
        identityVerifiedAt: new Date(),
        activatedAt: new Date(),
      },
    });

    // Assign Landlord role
    await this.rolesService.assignRole(finalUserId, AppRole.LANDLORD);

    return {
      message: 'Landlord profile activated successfully',
      profile: updatedProfile,
    };
  }
}
