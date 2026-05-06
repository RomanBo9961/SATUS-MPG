import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { DetectionsService } from './detections.service';
import { CreateDetectionDto } from './dto/create-detection.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guard';

@Controller('detections')
export class DetectionsController {
  constructor(private readonly detectionsService: DetectionsService) { }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAll(@Request() req: any) {
    const userId = req.user._id;

    // ID al servicio para que filtre la búsqueda
    return this.detectionsService.findAll(userId);
  }
  /*@Post()
  async handleExtensionAnalysis(@Body() createDetectionDto: CreateDetectionDto) {
  
    const cleanUrl = String(createDetectionDto.url).trim();
    
    return this.detectionsService.analyzeUrl(cleanUrl);
  } */

 @UseGuards(JwtAuthGuard)
  @Post('scan')
  async handleExtensionAnalysis(@Body() body: any, @Request() req: any) {
    const rawUrl = body.url;

    // Extracción auto del ID del usuario logueado 
    const userId = req.user._id;

    console.log(`📥 ESCANEO INICIADO POR USUARIO: ${userId}`);
    console.log("🔗 URL:", rawUrl);

    if (!rawUrl) return { status: "error", message: "No URL provided" };

    // Enviamos la URL y el ID del dueño al servicio
    return this.detectionsService.analyzeUrl(rawUrl, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('check-integrity')
  async checkIntegrity(@Body() body: { url: string }, @Request() req: any) {
    const userId = req.user._id;
    console.log(`🛡️ VERIFICANDO INTEGRIDAD: ${body.url}`);
    return this.detectionsService.checkIntegrity(body.url, userId);
  }

  // [NIVEL PRO] ANÁLISIS DE ENLACES EXTERNOS (MODO CENTINELA)
  @UseGuards(JwtAuthGuard)
  @Post('bulk-check')
  async bulkCheck(@Body() body: { links: string[] }, @Request() req: any) {
    const userId = req.user._id;
    console.log(`🕵️ MODO CENTINELA: Analizando ${body.links.length} enlaces.`);
    // Aquí podrías llamar al método bulkCheck que procesa con Groq + VT
    return this.detectionsService.bulkCheck(body.links);

}

}