import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  async checkHealth() {
    try {
      // Execute a quick database query (SELECT 1) to verify database connectivity
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'UP',
        timestamp: new Date().toISOString(),
        details: {
          database: {
            status: 'UP',
          },
        },
      };
    } catch (error) {
      return {
        status: 'DOWN',
        timestamp: new Date().toISOString(),
        details: {
          database: {
            status: 'DOWN',
            error: error.message,
          },
        },
      };
    }
  }
}
