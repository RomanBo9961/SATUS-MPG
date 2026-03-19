import { Controller, Post, Body } from '@nestjs/common';
import { DetectionsService } from './detections.service';
import { CreateDetectionDto } from './dto/create-detection.dto';

@Controller('detections')
export class DetectionsController {
  constructor(private readonly detectionsService: DetectionsService) {}

 @Post()
async handleExtensionAnalysis(@Body() createDetectionDto: CreateDetectionDto) {
  // Forzamos que la URL sea un string limpio antes de mandarla al servicio
  const cleanUrl = String(createDetectionDto.url).trim();
  
  // Enviamos al servicio (el cerebro) la URL ya saneada
  return this.detectionsService.analyzeUrl(cleanUrl);
}

}
