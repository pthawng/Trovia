import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import {
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyEmailDto,
} from './dto/auth-requests.dto';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { AppRole } from '@prisma/client';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Email address already registered');
    }

    const passwordHash = await argon2.hash(dto.password);

    // Generate email verification token (raw → hashed before DB)
    const rawVerifyToken = crypto.randomBytes(32).toString('hex');
    const hashedVerifyToken = await argon2.hash(rawVerifyToken);
    const verifyExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    // Get or create default TENANT role
    let tenantRole = await this.prisma.role.findUnique({
      where: { name: AppRole.TENANT },
    });

    if (!tenantRole) {
      tenantRole = await this.prisma.role.create({
        data: { name: AppRole.TENANT },
      });
    }

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        fullName: dto.fullName,
        phone: dto.phone,
        city: dto.city,
        emailVerificationToken: hashedVerifyToken,
        emailVerificationExpiry: verifyExpiry,
        userRoles: {
          create: {
            roleId: tenantRole.id,
          },
        },
        // Create default email preferences for new user
        emailPreference: {
          create: {},
        },
      },
      include: {
        userRoles: {
          include: { role: true },
        },
      },
    });

    // Send welcome + verification emails (fire-and-forget: errors are logged internally)
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const verifyUrl = `${frontendUrl}/verify-email?token=${rawVerifyToken}&email=${encodeURIComponent(user.email)}`;

    this.mailService.sendWelcomeEmail(user).catch((err) =>
      this.logger.error('[AuthService] sendWelcomeEmail failed', err),
    );
    this.mailService.sendVerifyEmail(user, verifyUrl).catch((err) =>
      this.logger.error('[AuthService] sendVerifyEmail failed', err),
    );

    return this.sanitizeUser(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: {
        userRoles: {
          include: { role: true },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await argon2.verify(
      user.passwordHash,
      dto.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const roles = user.userRoles.map((ur) => ur.role.name);
    const tokens = await this.generateTokens(user.id, user.email, roles);

    // Save refresh token to database
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async logout(refreshToken: string) {
    await this.prisma.refreshToken.updateMany({
      where: { token: refreshToken },
      data: { isRevoked: true },
    });
    return { message: 'Logged out successfully' };
  }

  async refresh(refreshToken: string) {
    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: {
        user: {
          include: {
            userRoles: {
              include: { role: true },
            },
          },
        },
      },
    });

    if (
      !tokenRecord ||
      tokenRecord.isRevoked ||
      tokenRecord.expiresAt < new Date()
    ) {
      // Security: revoke all tokens for user on reuse detection
      if (tokenRecord) {
        await this.prisma.refreshToken.updateMany({
          where: { userId: tokenRecord.userId },
          data: { isRevoked: true },
        });
      }
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Revoke old token and rotate
    await this.prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: { isRevoked: true },
    });

    const user = tokenRecord.user;
    const roles = user.userRoles.map((ur) => ur.role.name);
    const tokens = await this.generateTokens(user.id, user.email, roles);

    // Save new refresh token
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: { role: true },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.sanitizeUser(user);
  }

  // ── Forgot Password ───────────────────────────────────────────────────────

  async forgotPassword(dto: ForgotPasswordDto) {
    // SECURITY: Generic response regardless of whether email exists
    const GENERIC_MSG =
      'Nếu email tồn tại, hướng dẫn đặt lại mật khẩu đã được gửi.';

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      // Don't reveal existence — return same generic message
      return { message: GENERIC_MSG };
    }

    // Generate single-use reset token (raw → hashed before DB)
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = await argon2.hash(rawToken);
    const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: hashedToken,
        passwordResetExpiry: expiry,
      },
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/reset-password?token=${rawToken}&email=${encodeURIComponent(user.email)}`;

    // Fire-and-forget — do not let email failure expose the response timing
    this.mailService.sendForgotPasswordEmail(user, resetUrl).catch((err) =>
      this.logger.error('[AuthService] sendForgotPasswordEmail failed', err),
    );

    return { message: GENERIC_MSG };
  }

  // ── Reset Password ────────────────────────────────────────────────────────

  async resetPassword(dto: ResetPasswordDto, email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (
      !user ||
      !user.passwordResetToken ||
      !user.passwordResetExpiry ||
      user.passwordResetExpiry < new Date()
    ) {
      throw new BadRequestException(
        'Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.',
      );
    }

    // Verify raw token against stored hash
    const isValid = await argon2.verify(user.passwordResetToken, dto.token);
    if (!isValid) {
      throw new BadRequestException(
        'Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.',
      );
    }

    // Hash the new password
    const newPasswordHash = await argon2.hash(dto.newPassword);

    // Update password + invalidate token (single-use)
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newPasswordHash,
        passwordResetToken: null,
        passwordResetExpiry: null,
      },
    });

    // Revoke all existing refresh tokens for security
    await this.prisma.refreshToken.updateMany({
      where: { userId: user.id },
      data: { isRevoked: true },
    });

    // Send success confirmation email (fire-and-forget)
    this.mailService.sendResetPasswordSuccessEmail(user).catch((err) =>
      this.logger.error('[AuthService] sendResetPasswordSuccessEmail failed', err),
    );

    return { message: 'Mật khẩu đã được đặt lại thành công.' };
  }

  // ── Email Verification ────────────────────────────────────────────────────

  async verifyEmail(dto: VerifyEmailDto, email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (
      !user ||
      !user.emailVerificationToken ||
      !user.emailVerificationExpiry ||
      user.emailVerificationExpiry < new Date()
    ) {
      throw new BadRequestException(
        'Liên kết xác minh không hợp lệ hoặc đã hết hạn.',
      );
    }

    if (user.isEmailVerified) {
      return { message: 'Email đã được xác minh trước đó.' };
    }

    const isValid = await argon2.verify(user.emailVerificationToken, dto.token);
    if (!isValid) {
      throw new BadRequestException(
        'Liên kết xác minh không hợp lệ hoặc đã hết hạn.',
      );
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
        emailVerificationToken: null,
        emailVerificationExpiry: null,
      },
    });

    return { message: 'Email đã được xác minh thành công.' };
  }

  // ── Resend Verification ───────────────────────────────────────────────────

  async resendVerification(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.isEmailVerified) {
      return { message: 'Email đã được xác minh.' };
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = await argon2.hash(rawToken);
    const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: hashedToken,
        emailVerificationExpiry: expiry,
      },
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const verifyUrl = `${frontendUrl}/verify-email?token=${rawToken}&email=${encodeURIComponent(user.email)}`;

    this.mailService.sendVerifyEmail(user, verifyUrl).catch((err) =>
      this.logger.error('[AuthService] resendVerification sendVerifyEmail failed', err),
    );

    return {
      message:
        'Nếu email tồn tại và chưa xác minh, một liên kết xác minh mới đã được gửi.',
    };
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  private async generateTokens(
    userId: string,
    email: string,
    roles: AppRole[],
  ) {
    const payload = { id: userId, email, roles };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret:
        process.env.JWT_ACCESS_SECRET ||
        'trovia_super_secret_access_key_faang_level',
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret:
        process.env.JWT_REFRESH_SECRET ||
        'trovia_super_secret_refresh_key_faang_level',
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    });

    return { accessToken, refreshToken };
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
      roles,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
