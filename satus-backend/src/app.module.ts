import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose'; 
import * as Joi from 'joi';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { enviroments } from './enviroments';
import { DetectionsModule } from './detections/detections.module';
import config from './config';

const nodeEnv = process.env.NODE_ENV || 'dev'; 

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: enviroments[nodeEnv as keyof typeof enviroments] || '.env',
      load: [config],
      isGlobal: true,
      validationSchema: Joi.object({
        
        MONGO_INITDB_ROOT_USERNAME: Joi.string().required(),
        MONGO_INITDB_ROOT_PASSWORD: Joi.string().required(),
        MONGO_NAME: Joi.string().required(),
        MONGO_PORT: Joi.number().required(),
        MONGO_HOST: Joi.string().required(),
        MONGO_CONNECTION: Joi.string().required(), // Ej: mongodb
        
        // Modulo d Cibersec & Auth
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRES_IN: Joi.string().required(), // Admite '24h'
        VT_API_KEY: Joi.string().required(),     // Para VT
        AI_API_KEY: Joi.string().required(),     // Para traductor humano
      }),
    }),
    DatabaseModule, 
    AuthModule,
    UsersModule,
    DetectionsModule,
    // Nota: Roles y Permissions se manejarán como campos en el Doc de Usuario en Mongo
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
