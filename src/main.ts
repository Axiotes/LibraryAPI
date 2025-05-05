import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { LoggerService } from './common/utils/logger/logger.service';
import { ErrorInterceptor } from './common/interceptors/error/error.interceptor';
import { LoggerInterceptor } from './common/interceptors/logger/logger.interceptor';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  const logger = app.get(LoggerService);
  app.useGlobalInterceptors(new ErrorInterceptor(logger));
  app.useGlobalInterceptors(new LoggerInterceptor(logger));

  app.setGlobalPrefix('api/v1');

  const config = new DocumentBuilder()
    .setTitle('LibraryAPI')
    .setDescription(
      'API RESTful desenvolvida para realizar o gerenciamento de livros em uma biblioteca, permitindo o controle de usuários, livros e empréstimos.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const documentFactory = (): OpenAPIObject =>
    SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, documentFactory);

  await app.listen(3000);
}
bootstrap();
