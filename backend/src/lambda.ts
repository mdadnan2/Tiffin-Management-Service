import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import serverlessExpress from '@vendia/serverless-express';
import { Handler } from 'aws-lambda';

let cachedServer: Handler;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn'],
  });

  app.enableCors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  await app.init();

  const expressApp = app.getHttpAdapter().getInstance();
  return serverlessExpress({ app: expressApp });
}

export const handler: Handler = async (event, context, callback) => {
  try {
    if (!cachedServer) {
      cachedServer = await bootstrap();
    }
    return cachedServer(event, context, callback);
  } catch (error) {
    console.error('Lambda handler error:', error);
    console.error('Event:', JSON.stringify(event));
    console.error('Context:', JSON.stringify(context));
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: 'Internal server error',
        error: error.message,
        stack: error.stack,
        event,
        context
      })
    };
  }
};
