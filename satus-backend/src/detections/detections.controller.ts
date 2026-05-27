import { Controller, Post, Body, Get, UseGuards, Request, Query } from '@nestjs/common';
import { DetectionsService } from './detections.service';
import { CreateDetectionDto } from './dto/create-detection.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { JwtService } from '@nestjs/jwt';

@Controller('detections')
export class DetectionsController {
  constructor(
    private readonly detectionsService: DetectionsService,
    private readonly jwtService: JwtService) { }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAll(@Request() req: any,
    @Query('page') page: number = 1,      //  Captura pág
    @Query('limit') limit: number = 10,   // Captura límite
    @Query('search') search: string = '', //  Captura búsqueda
    @Query('risk') risk: string = 'ALL'   // Captura filtro
  ) {
    const userId = req.user._id;

    // ID al servicio para que filtre la búsqueda
    return this.detectionsService.findAll(userId,
      Number(page),
      Number(limit),
      search,
      risk);
  }

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

  //@UseGuards(JwtAuthGuard)
  @Post('check-integrity')
  async checkIntegrity(@Body() body: { url: string }, @Request() req: any) {
    const userId = this.extractUserIdFromHeader(req); // Extracción manual blindada
    console.log(`🛡️ VERIFICANDO INTEGRIDAD PERIMETRAL: ${body.url}`);
    return this.detectionsService.checkIntegrity(body.url, userId);
  }

  // [NIVEL PRO] ANÁLISIS DE ENLACES EXTERNOS (MODO CENTINELA)
  //@UseGuards(JwtAuthGuard)
  @Post('bulk-check')
  async bulkCheck(@Body() body: { links: string[] }, @Request() req: any) {
    const userId = this.extractUserIdFromHeader(req); // Extracción manual blindada
    console.log(`🕵️ MODO CENTINELA ACTIVO: Analizando ráfaga de ${body.links.length} enlaces.`);
    return this.detectionsService.bulkCheck(body.links, userId);
  }

  @Get('stats/global')
  async getGlobalStats() {
    //console.log('📡 [NÚCLEO] Extrayendo telemetría histórica global de MongoDB...');
    return this.detectionsService.countGlobalDanger();
  }

  private extractUserIdFromHeader(req: any): string | null {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader === 'Bearer GUEST_TOKEN') {
        return null;
      }

      const token = authHeader.split(' ')[1];
      const decoded = this.jwtService.decode(token) as any;
      return decoded?._id || decoded?.sub || null; // Extrae el ID real de satusBG de la firma [google:1]
    } catch {
      return null; // En caso de token corrupto o expirado, no colapsa; cae a modo invitado de forma segura
    }
  }

}