import { Controller, Post, Body } from '@nestjs/common';
import { DetectionsService } from './detections.service';
import { CreateDetectionDto } from './dto/create-detection.dto';

@Controller('detections')
export class DetectionsController {
  constructor(private readonly detectionsService: DetectionsService) {}

  @Post()
  async handleExtensionAnalysis(@Body() createDetectionDto: CreateDetectionDto) {
    // 1. Desestructuramos la URL validada que viene de la extensión
    const { url } = createDetectionDto;
    
    // Llama al servicio (el cerebro/central) para procesar
    return this.detectionsService.analyzeUrl(url);
  }
}
