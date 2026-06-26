import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as bodyParser from 'body-parser';

async function bootstrap() {

  const app = await NestFactory.create(AppModule, { bodyParser: true });

  app.enableCors({
    origin: ['https://satus-ecosystem.onrender.com', 'http://localhost:4200'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
  });
  app.setGlobalPrefix('api');
  //await app.listen(3000);
  // app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

  //console.log('📋 --- [TELEMETRÍA SATUS] MAPA DE COMPUERTAS ACTIVAS ---');

  const config = new DocumentBuilder()
    .setTitle('API')
    .setDescription('The SATUS API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  //console.log('⚠️ [TELEMETRÍA] El router nativo de Express no está accesible directamente.');

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
