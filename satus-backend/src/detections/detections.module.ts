import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { DetectionsService } from './detections.service';
import { DetectionsController } from './detections.controller';
import { Detection, DetectionSchema } from './entities/detection.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Detection.name, schema: DetectionSchema }
    ]),
    HttpModule,
    JwtModule.register({})
  ],
  controllers: [DetectionsController],
  providers: [DetectionsService],
  exports: [DetectionsService]
})
export class DetectionsModule { }