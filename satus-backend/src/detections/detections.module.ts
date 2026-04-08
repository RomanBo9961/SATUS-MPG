import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios'; 
import { DetectionsService } from './detections.service';
import { DetectionsController } from './detections.controller';
import { Detection, DetectionSchema } from './entities/detection.entity';

@Module({
  imports: [
    // 👇 ESTO ES LO QUE FALTA: Registrar el modelo en el módulo
    MongooseModule.forFeature([
      { name: Detection.name, schema: DetectionSchema }
    ]),
    HttpModule
  ],
  controllers: [DetectionsController],
  providers: [DetectionsService],
  exports: [DetectionsService] // Por si lo necesitas en otro lado
})
export class DetectionsModule {}