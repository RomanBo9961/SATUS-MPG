import { Injectable, Inject } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import type { ConfigType } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../config';

@Injectable()
export class DetectionsService {
  private genAI: GoogleGenerativeAI;

  constructor(
    private readonly httpService: HttpService,
    @Inject(config.KEY) private configService: ConfigType<typeof config>,
  ) {
    this.genAI = new GoogleGenerativeAI(this.configService.apiKeys.ai!);
  }

  async analyzeUrl(url: string) {
    const cleanUrl = url.trim();
    console.log("1. LLEGADA AL SERVICE:", cleanUrl);

    const apiKey = this.configService.apiKeys.vt!;
    const urlBase64 = Buffer.from(cleanUrl).toString('base64').replace(/=/g, '');

    try {
      // 1. INTENTAR CONSULTA (GET)
      const vtReport = await this.fetchVTReport(urlBase64, apiKey);
      const aiAdvice = await this.getAiAdvice(cleanUrl, vtReport.details);
      return { ...vtReport, message: aiAdvice };

  } catch (error: any) {
      if (error.response?.status === 404) {
        console.log("📡 Link nuevo detectado. Enviando a escaneo...");
        try {
          // 🚀 CAMBIO 1: Agregada la ruta completa de la API
          const vtEndpoint = 'https://www.virustotal.com/api/v3/urls';
          
          const body = new URLSearchParams();
          body.append('url', cleanUrl);

          await firstValueFrom(
            this.httpService.post(vtEndpoint, body.toString(), { 
              headers: { 
                'x-apikey': apiKey, 
                'Content-Type': 'application/x-www-form-urlencoded' 
              } 
            })
          );
          
          return { 
            status: "processing", 
            message: "🌀 Link nuevo. SATUS lo está analizando. ¡Reintenta en 10 segundos!" 
          };
        } catch (postError: any) {
          console.error("❌ ERROR POST VT:", postError.response?.data || postError.message);
          return { status: "error", message: "No se pudo iniciar el escaneo." };
        }
      }
      return { status: "error", message: "Error de comunicación con la inteligencia." };
    }
  }

  private async fetchVTReport(urlBase64: string, apiKey: string) {
    
    const response = await firstValueFrom(
      this.httpService.get(`https://www.virustotal.com/api/v3/urls/${urlBase64}`, { 
        headers: { 'x-apikey': apiKey }
      })
    );

    const attributes = response.data.data.attributes;
    const stats = attributes.last_analysis_stats;

    return {
      status: "success",
      riskLevel: stats.malicious > 0 ? "ALTO" : "BAJO",
      details: {
        stats: stats,           // Números (Malicious, Harmless...)
        info: attributes,       // Contexto (Title, Categories, Reputation...)
        lastAnalysis: attributes.last_analysis_results //Reporte Unitario Motor Antimlware (opcional)
      }
    };
  }

 private async getAiAdvice(url: string, details: any) {
    try {
      const model = this.genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });
      
      // Extrae datos reales de atributos que vienen de VT
      const stats = details.stats;
      const info = details.info;

      const reputacion = info.reputation || 0;
      // Separacion por comas
      const categorias = info.categories ? Object.values(info.categories).join(", ") : "General / Información";

      // PROMPT GEMINI
      const prompt = `Actúa como un analista experto de SATUS. 
      Analiza el siguiente enlace: ${url}
      
      DATOS TÉCNICOS DE SEGURIDAD:
      - Detecciones Maliciosas: ${stats.malicious} de ${stats.malicious + stats.harmless} motores.
      - Puntuación de Reputación: ${reputacion}
      - Categoría del Sitio: ${categorias}

      INSTRUCCIONES:
      Escribe un reporte humanizado que pueda comprender un usuario normal de internet y que a la vez luzca profesional (entre 30 y 50 palabras). 
      No digas solo "es seguro". Explica que la decisión se basa en la reputación del dominio y la ausencia (o presencia) de motores de malware. 
      Ademas ten en cuenta que terminos como pishing o scammer son desconocidos para el suaurio normal en consecuencia debes explicar como "este sitio no 
      almacenara sus datos bancarios o contraseñas" y de detectar que si lo hara explicar que y como.
      Si el sitio es muy conocido, menciona su fiabilidad como fuente de información.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (e) {
      // Plan B por si la IA se duerme
     console.error("❌ Error en getAiAdvice:", e); 
      
      const malicious = details.stats?.malicious || 0;

      return malicious > 0 
        ? `⚠️ ¡Peligro! ${malicious} motores de seguridad detectaron amenazas activas.` 
        : "✅ Enlace verificado: Los motores de seguridad no reportan malware ni phishing en este dominio.";
     }
  }
}
