import { Module, Global } from '@nestjs/common';
import { validateConfig } from './env.config';

@Global()
@Module({
  providers: [
    {
      provide: 'ENV_CONFIG',
      useFactory: () => {
        return validateConfig(process.env);
      },
    },
  ],
  exports: ['ENV_CONFIG'],
})
export class ConfigModule {}
