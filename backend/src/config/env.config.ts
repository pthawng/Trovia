import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  validateSync,
} from 'class-validator';
import { plainToInstance } from 'class-transformer';

export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment = Environment.Development;

  @IsNumber()
  PORT: number = 3001;

  @IsString()
  DATABASE_URL: string;

  @IsString()
  JWT_ACCESS_SECRET: string = 'trovia_super_secret_access_key_faang_level';

  @IsString()
  JWT_REFRESH_SECRET: string = 'trovia_super_secret_refresh_key_faang_level';

  @IsString()
  JWT_ACCESS_EXPIRES_IN: string = '15m';

  @IsString()
  JWT_REFRESH_EXPIRES_IN: string = '7d';

  @IsString()
  FRONTEND_URL: string = 'http://localhost:3000';

  @IsString()
  @IsOptional()
  COOKIE_DOMAIN?: string;

  @IsString()
  COOKIE_SECURE: string = 'false';
}

export function validateConfig(config: Record<string, any>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(`Config validation error: ${errors.toString()}`);
  }
  return validatedConfig;
}
