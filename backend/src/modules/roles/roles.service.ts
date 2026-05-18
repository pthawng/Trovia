import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AppRole, LandlordStatus } from '@prisma/client';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async assignRole(userId: string, roleName: AppRole) {
    const role = await this.prisma.role.findUnique({
      where: { name: roleName },
    });

    if (!role) {
      throw new Error(`Role ${roleName} does not exist`);
    }

    return this.prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId,
          roleId: role.id,
        },
      },
      update: {},
      create: {
        userId,
        roleId: role.id,
      },
    });
  }

  async checkLandlordActive(userId: string) {
    const profile = await this.prisma.landlordProfile.findUnique({
      where: { userId },
    });

    if (!profile || profile.status !== LandlordStatus.ACTIVE) {
      throw new ForbiddenException(
        'Landlord capability is not active. Please complete onboarding and verification.',
      );
    }
    return true;
  }
}
