import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../../database/prisma.module';
import { OAuthService } from './oauth.service';
import { GoogleProviderAdapter } from './google-provider.adapter';

@Global()
@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      global: true,
      secret:
        process.env.JWT_ACCESS_SECRET ||
        'trovia_super_secret_access_key_faang_level',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, OAuthService, GoogleProviderAdapter],
  exports: [AuthService, OAuthService],
})
export class AuthModule {}
