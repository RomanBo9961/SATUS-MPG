import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose'; 
import { ModulesService } from './modules.service';
import { ModulesController } from './modules.controller';
import { ModuleEntity, ModuleSchema } from './entities/module.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ModuleEntity.name, schema: ModuleSchema }])
  ],
  providers: [ModulesService],
  controllers: [ModulesController],
  exports: [ModulesService, MongooseModule], 
})
export class ModulesModule {}
