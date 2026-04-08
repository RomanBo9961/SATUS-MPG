import { Controller, Post, Body, Get } from '@nestjs/common';
import { DetectionsService } from './detections.service';
import { CreateDetectionDto } from './dto/create-detection.dto';

@Controller('detections')
export class DetectionsController {
  constructor(private readonly detectionsService: DetectionsService) {}

   @Get()
async getAll() {
  return this.detectionsService.findAll(); // O el nombre que tenga tu método de búsqueda
}
 /*@Post()
async handleExtensionAnalysis(@Body() createDetectionDto: CreateDetectionDto) {
  // Forzamos que la URL sea un string limpio antes de mandarla al servicio
  const cleanUrl = String(createDetectionDto.url).trim();
  
  // Enviamos al servicio (el cerebro) la URL ya saneada
  return this.detectionsService.analyzeUrl(cleanUrl);
} */

    @Post('scan')
  async handleExtensionAnalysis(@Body() body: any) {
    // 🚩 PRUEBA DEFINITIVA: Leemos directamente del body sin pasar por el DTO
    const rawUrl = body.url;
    console.log("📥 URL DIRECTA DEL BODY:", rawUrl);

    if (!rawUrl) return { status: "error", message: "No URL provided" };
    
    //return this.detectionsService.analyzeUrl(String(rawUrl).trim());
    return this.detectionsService.analyzeUrl(rawUrl);

  }


}
