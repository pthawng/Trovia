import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Access token is missing');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret:
          process.env.JWT_ACCESS_SECRET ||
          'trovia_super_secret_access_key_faang_level',
      });
      // Attach user payload to request
      request['user'] = payload;
    } catch (error) {
      throw new UnauthorizedException('Access token is invalid or expired');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    if (type === 'Bearer') {
      return token;
    }
    if (request.cookies && request.cookies.accessToken) {
      return request.cookies.accessToken;
    }
    return undefined;
  }
}
