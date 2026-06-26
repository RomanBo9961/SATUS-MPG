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

        //const portString = connection.includes('+srv') ? '' : (port ? `:${port}` : '');
        const portSection = connection.includes('srv') ? '' : (port ? `:${port}` : '');

        return {

          uri: `${connection}://${user}:${password}@${host}${portSection}/${dbName}?authSource=admin`,
          authSource: 'admin',
        };
      },
    }),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule { }
