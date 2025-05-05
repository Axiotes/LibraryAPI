import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  app.setGlobalPrefix('api/v1');

  const config = new DocumentBuilder()
    .setTitle('LibraryAPI')
    .setDescription(
      'API RESTful desenvolvida para realizar o gerenciamento de livros em uma biblioteca, permitindo o controle de usuários, livros e empréstimos.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, documentFactory);

  await app.listen(3000);
}
bootstrap();
