import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateEmailPreferencesDto } from './dto/update-preferences.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: { role: true },
        },
      },
    });

    if (!user || user.deletedAt) {
      throw new NotFoundException('User profile not found');
    }

    return this.sanitizeUser(user);
  }

  async updateProfile(userId: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.deletedAt) {
      throw new NotFoundException('User profile not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        fullName: dto.fullName !== undefined ? dto.fullName : user.fullName,
        avatarUrl: dto.avatarUrl !== undefined ? dto.avatarUrl : user.avatarUrl,
        phone: dto.phone !== undefined ? dto.phone : user.phone,
        city: dto.city !== undefined ? dto.city : user.city,
        occupation: dto.occupation !== undefined ? dto.occupation : user.occupation,
        bio: dto.bio !== undefined ? dto.bio : user.bio,
        preferredDistrict: dto.preferredDistrict !== undefined ? dto.preferredDistrict : user.preferredDistrict,
        budgetRange: dto.budgetRange !== undefined ? dto.budgetRange : user.budgetRange,
        moveInTimeline: dto.moveInTimeline !== undefined ? dto.moveInTimeline : user.moveInTimeline,
        dateOfBirth: dto.dateOfBirth !== undefined
          ? (dto.dateOfBirth ? new Date(dto.dateOfBirth) : null)
          : user.dateOfBirth,
        renterType: dto.renterType !== undefined ? dto.renterType : user.renterType,
        budgetMin: dto.budgetMin !== undefined ? (dto.budgetMin ? Number(dto.budgetMin) : null) : user.budgetMin,
        budgetMax: dto.budgetMax !== undefined ? (dto.budgetMax ? Number(dto.budgetMax) : null) : user.budgetMax,
        expectedMoveInDate: dto.expectedMoveInDate !== undefined
          ? (dto.expectedMoveInDate ? new Date(dto.expectedMoveInDate) : null)
          : user.expectedMoveInDate,
      },
      include: {
        userRoles: {
          include: { role: true },
        },
      },
    });

    return this.sanitizeUser(updatedUser);
  }

  async getEmailPreferences(userId: string) {
    let pref = await this.prisma.emailPreference.findUnique({
      where: { userId },
    });

    if (!pref) {
      // Auto-create with defaults on first access
      pref = await this.prisma.emailPreference.create({
        data: { userId },
      });
    }

    return pref;
  }

  async updateEmailPreferences(userId: string, dto: UpdateEmailPreferencesDto) {
    const data: Partial<typeof dto> = {};

    if (dto.authEmailsEnabled !== undefined) data.authEmailsEnabled = dto.authEmailsEnabled;
    if (dto.rentalEmailsEnabled !== undefined) data.rentalEmailsEnabled = dto.rentalEmailsEnabled;
    if (dto.contractEmailsEnabled !== undefined) data.contractEmailsEnabled = dto.contractEmailsEnabled;
    if (dto.paymentEmailsEnabled !== undefined) data.paymentEmailsEnabled = dto.paymentEmailsEnabled;
    if (dto.maintenanceEmailsEnabled !== undefined) data.maintenanceEmailsEnabled = dto.maintenanceEmailsEnabled;
    if (dto.marketingEmailsEnabled !== undefined) data.marketingEmailsEnabled = dto.marketingEmailsEnabled;

    return this.prisma.emailPreference.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    });
  }

  private sanitizeUser(user: any) {
    const roles = user.userRoles?.map((ur: any) => ur.role.name) || [];
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      phone: user.phone,
      city: user.city,
      occupation: user.occupation,
      dateOfBirth: user.dateOfBirth,
      bio: user.bio,
      preferredDistrict: user.preferredDistrict,
      budgetRange: user.budgetRange,
      moveInTimeline: user.moveInTimeline,
      renterType: user.renterType,
      budgetMin: user.budgetMin,
      budgetMax: user.budgetMax,
      expectedMoveInDate: user.expectedMoveInDate,
      roles,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
