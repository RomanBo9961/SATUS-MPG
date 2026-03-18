import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose'; // <--- CAMBIO
import { RolesService } from './services/roles.service';
import { RolesController } from './controllers/roles.controller';
import { Role, RoleSchema } from './entities/role.entity';
import { ModulesModule } from '../modules/modules.module';

@Module({
  imports: [
    // Registramos el Schema de Roles
    MongooseModule.forFeature([{ name: Role.name, schema: RoleSchema }]), 
    ModulesModule
  ],
  providers: [RolesService],
  controllers: [RolesController],
  exports: [RolesService, MongooseModule] // Exportamos MongooseModule para que otros lo usen
})
export class RolesModule {}
