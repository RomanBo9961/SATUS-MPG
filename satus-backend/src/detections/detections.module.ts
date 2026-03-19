import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios'; 
import { DetectionsService } from './detections.service';
import { DetectionsController } from './detections.controller';

@Module({
  imports: [HttpModule],
  controllers: [DetectionsController],
  providers: [DetectionsService],
})
export class DetectionsModule {}
