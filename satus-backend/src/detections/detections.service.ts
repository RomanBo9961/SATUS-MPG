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
    // Inicializamos Gemini con la API KEY de Google
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
      // 2. SI EL LINK ES NUEVO (404)
      if (error.response?.status === 404) {
        console.log("📡 Link nuevo detectado. Enviando a escaneo...");
        try {
          // 🚀 LA SOLUCIÓN DEFINITIVA:
          // 1. URL completa de la API (/api/v3/urls)
          // 2. Cuerpo plano 'url=...' para evitar doble codificación de %C3
          const vtEndpoint = 'https://www.virustotal.com';
          const payload = `url=${cleanUrl}`; 

          await firstValueFrom(
            this.httpService.post(vtEndpoint, payload, { 
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
          console.error("❌ DETALLE ERROR VT:", postError.response?.data || postError.message);
          return { status: "error", message: "No se pudo iniciar el escaneo." };
        }
      }
      return { status: "error", message: "Error de comunicación con la inteligencia." };
    }
  }

  // 🤖 MÉTODO DE IA: Traduce números a lenguaje humano (Gemini)
  private async getAiAdvice(url: string, stats: any) {
    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Analiza estos datos de VirusTotal para el link "${url}":
      Motores Maliciosos: ${stats.malicious}, Sospechosos: ${stats.suspicious}, Limpios: ${stats.harmless}.
      Dime en una frase breve y directa (máximo 15 palabras) si es seguro entrar y por qué. Tono experto en ciberseguridad.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (e) {
      return stats.malicious > 0 ? "⚠️ ¡Peligro detectado! No entres." : "✅ El link parece seguro.";
    }
  }

  private async fetchVTReport(urlBase64: string, apiKey: string) {
    // ✅ URL CORRECTA DE API V3 PARA CONSULTA
    const response = await firstValueFrom(
      this.httpService.get(`https://www.virustotal.com/${urlBase64}`, {
        headers: { 'x-apikey': apiKey }
      })
    );
    const stats = response.data.data.attributes.last_analysis_stats;
    return {
      status: "success",
      riskLevel: stats.malicious > 0 ? "ALTO" : "BAJO",
      details: stats
    };
  }
}
