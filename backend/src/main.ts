import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Parse HTTP environment configurations
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const port = process.env.PORT || 3001;

  // 1. Enable Global Prefix
  app.setGlobalPrefix('api');

  // 2. Enable Security Middlewares
  const isProd = process.env.NODE_ENV === 'production';
  if (isProd) {
    app.use(helmet());
  } else {
    // Relaxed helmet in development to prevent CORS / preflight / resource sharing blocks
    app.use(
      helmet({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
        contentSecurityPolicy: false,
      }),
    );
  }
  app.use(cookieParser());

  // Enable CORS with support for dynamic local development loopback addresses & any ports (e.g. 8000)
  app.enableCors({
    origin: (origin, callback) => {
      if (!isProd) {
        // Permit any localhost or 127.0.0.1 loopback with any port in development
        if (
          !origin ||
          /^http:\/\/localhost(:\d+)?$/.test(origin) ||
          /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)
        ) {
          callback(null, true);
          return;
        }
      }
      // Production or non-development matching
      if (!origin || origin === frontendUrl) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  // 3. Global Filters & Pipes
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strip properties that do not have any decorators in the DTO
      transform: true, // auto-transform payloads to match DTO types
      forbidNonWhitelisted: true,
    }),
  );

  // 4. Configure Swagger OpenAPI
  const config = new DocumentBuilder()
    .setTitle('Trovia API Gateway')
    .setDescription(
      'FAANG-grade secure backend documentation for Trovia PropTech Rental SaaS Platform. Includes robust httpOnly refresh token cookie rotation and RBAC capabilities.',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description:
          'Enter your JWT access token here to authenticate requests.',
        in: 'header',
      },
      'bearer',
    )
    .addCookieAuth('refreshToken', {
      type: 'apiKey',
      in: 'cookie',
      name: 'refreshToken',
      description:
        'Used automatically by the /api/auth/refresh rotation engine in httpOnly secure cookie.',
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // 5. Start Application
  await app.listen(port);
  console.log(
    `🚀 Trovia PropTech Backend is listening on: http://localhost:${port}/api`,
  );
  console.log(
    `📖 Interactive API documentation is available at: http://localhost:${port}/api/docs`,
  );
}
bootstrap();
