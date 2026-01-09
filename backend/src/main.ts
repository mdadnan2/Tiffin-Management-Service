import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters';
import serverlessExpress from '@vendia/serverless-express';
import { Handler } from 'aws-lambda';
import * as compression from 'compression';

let cachedServer: Handler;

async function bootstrapLambda() {
  const app = await NestFactory.create(AppModule);

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

  // Swagger (disabled for Lambda - avoid package.json lookup)
  if (!process.env.AWS_EXECUTION_ENV && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
    try {
      const { DocumentBuilder, SwaggerModule } = await import('@nestjs/swagger');
      const config = new DocumentBuilder()
        .setTitle('Tiffin Management API')
        .setDescription('Unified API for meal management system')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('api/docs', app, document);
    } catch (error) {
      console.warn('Swagger initialization skipped:', error);
    }
  }

  await app.init();
  const expressApp = app.getHttpAdapter().getInstance();
  return serverlessExpress({ app: expressApp });
}

async function bootstrapLocal() {
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

  try {
    const { DocumentBuilder, SwaggerModule } = await import('@nestjs/swagger');
    const config = new DocumentBuilder()
      .setTitle('Tiffin Management API')
      .setDescription('Unified API for meal management system')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  } catch (error) {
    console.warn('Swagger initialization skipped:', error);
  }

  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Tiffin Management API running on http://0.0.0.0:${port}`);
  console.log(`📚 Swagger docs available at http://0.0.0.0:${port}/api/docs`);
}

// Lambda handler
export const handler: Handler = async (event, context, callback) => {
  if (!cachedServer) {
    cachedServer = await bootstrapLambda();
  }
  return cachedServer(event, context, callback);
};

// Local development
if (!process.env.AWS_EXECUTION_ENV && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
  bootstrapLocal();
}
