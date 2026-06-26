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

        console.log(`📡 [AUDITORÍA DE VARIABLES DEL ENV]`);
        console.log(`➡️ CONNECTION: "${connection}" (Longitud: ${connection?.length})`);
        console.log(`➡️ USERNAME: "${user}" (Longitud: ${user?.length})`);
        console.log(`➡️ PASSWORD: "${password?.substring(0, 3)}...[TAPADO]" (Longitud: ${password?.length})`);
        console.log(`➡️ HOST: "${host}" (Longitud: ${host?.length})`);

        //const portString = connection.includes('+srv') ? '' : (port ? `:${port}` : '');
        const portSection = connection.includes('srv') ? '' : (port ? `:${port}` : '');

        const finalUri = `${connection}://${user}:${password}@${host}${portSection}/${dbName}`;

        console.log(`📡 [AUDITORÍA RED] URL construida: ${finalUri.replace(password, 'XXXXX')}`);

        return {

          uri: finalUri,
          //authSource: 'admin',
        };
      },
    }),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule { }
