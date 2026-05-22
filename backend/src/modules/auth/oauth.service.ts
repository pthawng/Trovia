import { Injectable, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';
import { GoogleProviderAdapter } from './google-provider.adapter';
import { AuthService } from './auth.service';

@Injectable()
export class OAuthService {
  constructor(
    private readonly googleAdapter: GoogleProviderAdapter,
    private readonly authService: AuthService,
  ) {}

  generateState(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  verifyState(cookieState: string, queryState: string): boolean {
    if (!cookieState || !queryState) {
      return false;
    }
    const cookieBuf = Buffer.from(cookieState);
    const queryBuf = Buffer.from(queryState);
    if (cookieBuf.length !== queryBuf.length) {
      return false;
    }
    try {
      return crypto.timingSafeEqual(cookieBuf, queryBuf);
    } catch {
      return false;
    }
  }

  getGoogleAuthorizationUrl(state: string): string {
    return this.googleAdapter.getAuthorizationUrl(state);
  }

  async handleGoogleCallback(code: string) {
    const profile = await this.googleAdapter.getProfileByCode(code);
    return await this.authService.loginOrRegisterOAuth(profile);
  }
}
