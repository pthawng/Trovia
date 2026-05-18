import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MailService } from './mail.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';

/**
 * MailController — ADMIN-only dev/test endpoint.
 * Never exposes MAIL credentials.  Only available in non-production environments.
 */
@ApiTags('Mail (Admin)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('test')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[ADMIN] Send a test welcome email to yourself' })
  async sendTest(@GetUser() user: { id: string; email: string; fullName?: string | null }) {
    if (process.env.NODE_ENV === 'production') {
      return { message: 'Test endpoint disabled in production.' };
    }
    await this.mailService.sendWelcomeEmail(user);
    return { message: `Test email dispatched to ${user.email}` };
  }
}
