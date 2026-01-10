import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters';
import * as compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(compression());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new AllExceptionsFilter());
  app.enableCors({
    origin: [
      process.env.FRONTEND_URL,
      'https://tiffin-management-service.vercel.app',
      'http://localhost:3000'
    ].filter(Boolean),
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Tiffin Management API')
    .setDescription('Unified API for meal management system')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Tiffin Management API running on http://0.0.0.0:${port}`);
  console.log(`📚 Swagger docs available at http://0.0.0.0:${port}/api/docs`);
}

bootstrap();
