import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';
import { join } from 'path';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('NestJS API')
    .setDescription('API documentation for the NestJS application')
    .setVersion('1.0')
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-custom-header', // Tên của header
        in: 'header', // Vị trí header (header, query, cookie)
      },
      'custom-header', // Tên định danh cho Swagger
    )
    .build();
  console.log(join(__dirname, '..', 'uploads'));

  app.use(
    '/static',
    express.static(join(__dirname, '..', 'uploads/images')),
    express.static(join(__dirname, '..', 'uploads/avatars')),
  );

  app.setGlobalPrefix('v1/api');

  app.useGlobalPipes(new ValidationPipe());
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
