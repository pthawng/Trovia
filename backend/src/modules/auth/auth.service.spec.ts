import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../../database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail/mail.service';
import { BadRequestException } from '@nestjs/common';
import { OAuthProvider, AppRole } from '@prisma/client';

describe('AuthService OAuth and Password Rejection', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  const mockUser = {
    id: 'user-1',
    email: 'oauth@example.com',
    passwordHash: null,
    fullName: 'OAuth User',
    isEmailVerified: true,
    userRoles: [{ role: { name: AppRole.TENANT } }],
  };

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    oAuthAccount: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    role: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrisma)),
  };

  const mockJwtService = {
    signAsync: jest.fn().mockResolvedValue('mock_token'),
  };

  const mockMailService = {
    sendWelcomeEmail: jest.fn().mockResolvedValue(true),
    sendVerifyEmail: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  describe('Password Login Rejection for OAuth-only accounts', () => {
    it('should throw BadRequestException if user has no passwordHash', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.login({ email: 'oauth@example.com', password: 'password123' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('loginOrRegisterOAuth', () => {
    const mockProfile = {
      id: 'google-sub-1',
      email: 'oauth@example.com',
      emailVerified: true,
      name: 'Google User',
      avatarUrl: 'https://avatar.png',
    };

    it('should log in directly if OAuthAccount mapping already exists', async () => {
      mockPrisma.oAuthAccount.findUnique.mockResolvedValue({
        id: 'oauth-1',
        userId: 'user-1',
        user: mockUser,
      });

      const result = await service.loginOrRegisterOAuth(mockProfile);

      expect(mockPrisma.oAuthAccount.findUnique).toHaveBeenCalled();
      expect(result.user.email).toBe(mockUser.email);
      expect(result.accessToken).toBe('mock_token');
    });

    it('should link OAuthAccount to existing user if email exists but mapping is missing', async () => {
      mockPrisma.oAuthAccount.findUnique.mockResolvedValue(null);
      mockPrisma.user.findUnique.mockResolvedValue({
        ...mockUser,
        id: 'user-existing',
      });

      const result = await service.loginOrRegisterOAuth(mockProfile);

      expect(mockPrisma.oAuthAccount.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-existing',
          provider: OAuthProvider.GOOGLE,
          providerAccountId: mockProfile.id,
          email: mockProfile.email,
        },
      });
      expect(result.user.id).toBe('user-existing');
    });

    it('should register a new user and link OAuthAccount if user does not exist', async () => {
      mockPrisma.oAuthAccount.findUnique.mockResolvedValue(null);
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.role.findUnique.mockResolvedValue({ id: 'role-tenant', name: AppRole.TENANT });
      
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-new',
        email: mockProfile.email,
        passwordHash: null,
        fullName: mockProfile.name,
        avatarUrl: mockProfile.avatarUrl,
        isEmailVerified: true,
        userRoles: [{ role: { name: AppRole.TENANT } }],
      });

      const result = await service.loginOrRegisterOAuth(mockProfile);

      expect(mockPrisma.user.create).toHaveBeenCalled();
      expect(mockPrisma.oAuthAccount.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-new',
          provider: OAuthProvider.GOOGLE,
          providerAccountId: mockProfile.id,
          email: mockProfile.email,
        },
      });
      expect(result.user.id).toBe('user-new');
    });
  });
});
