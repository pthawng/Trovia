import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';

export interface OAuthProfile {
  id: string;
  email: string;
  emailVerified: boolean;
  name: string;
  avatarUrl?: string;
}

@Injectable()
export class GoogleProviderAdapter {
  private readonly logger = new Logger(GoogleProviderAdapter.name);

  getAuthorizationUrl(state: string): string {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = process.env.GOOGLE_CALLBACK_URL;
    
    if (!clientId || !redirectUri) {
      throw new Error('Google OAuth credentials or callback URL are not configured.');
    }

    const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    const options = {
      redirect_uri: redirectUri,
      client_id: clientId,
      access_type: 'offline',
      response_type: 'code',
      prompt: 'consent',
      scope: ['openid', 'profile', 'email'].join(' '),
      state: state,
    };

    const qs = new URLSearchParams(options);
    return `${rootUrl}?${qs.toString()}`;
  }

  async getProfileByCode(code: string): Promise<OAuthProfile> {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_CALLBACK_URL;

    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error('Google OAuth credentials or callback URL are not configured.');
    }

    const tokenUrl = 'https://oauth2.googleapis.com/token';
    const values = {
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    };

    try {
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(values).toString(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`Failed to exchange authorization code: ${errorText}`);
        throw new UnauthorizedException('Không thể xác thực mã Google Authorization Code.');
      }

      const data = await response.json();
      const idToken = data.id_token;
      if (!idToken) {
        throw new UnauthorizedException('Không nhận được ID Token từ Google.');
      }

      return this.decodeIdToken(idToken);
    } catch (error) {
      this.logger.error('Error exchanging authorization code with Google', error.stack);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Xác thực Google OAuth thất bại.');
    }
  }

  private decodeIdToken(idToken: string): OAuthProfile {
    try {
      const parts = idToken.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
      }

      const payloadBase64 = parts[1];
      // base64url decoding
      const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
      const payloadJson = Buffer.from(base64, 'base64').toString('utf-8');
      const payload = JSON.parse(payloadJson);

      if (!payload.sub || !payload.email) {
        throw new Error('Missing sub or email claim in ID Token');
      }

      return {
        id: payload.sub,
        email: payload.email,
        emailVerified: payload.email_verified === true || payload.email_verified === 'true',
        name: payload.name || payload.email.split('@')[0],
        avatarUrl: payload.picture || null,
      };
    } catch (error) {
      this.logger.error('Failed to decode Google ID Token', error.stack);
      throw new UnauthorizedException('Không thể giải mã ID Token từ Google.');
    }
  }
}
