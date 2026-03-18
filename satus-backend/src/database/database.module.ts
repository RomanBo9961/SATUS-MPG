import { Module, Global } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import config from '../config';

@Global()
@Module({
  imports: [
    // Conex Asíncrona: Espera a que config.ts lea los .env
    MongooseModule.forRootAsync({
      inject: [config.KEY],
      useFactory: (configService: ConfigType<typeof config>) => {
        const { connection, user, password, host, port, dbName } = configService.database;
        
        return {
          // Construye la URI: mongodb://admin:615243@localhost:27017/
          uri: `${connection}://${user}:${password}@${host}:${port}/`,
          dbName,
          authSource: 'admin', // Indica que el usuario 'admin' está en la db de administración de Mongo
        };
      },
    }),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
