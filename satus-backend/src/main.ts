import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as bodyParser from 'body-parser'; // 🔹 Importante instalar o usar el nativo

async function bootstrap() {
  // 1. Deshabilitamos el bodyParser por defecto de Nest para meter uno controlado
  const app = await NestFactory.create(AppModule, { bodyParser: true });
  
  // 2. Quitamos el ValidationPipe global un segundo para la prueba
  // app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // 3. Forzamos el límite y el tipo de JSON
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

  // Habilitamos CORS por si la extensión tiene líos de origen
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('API')
    .setDescription('The SATUS API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
