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
    const cleanUrl = url.trim().replace(/([^:])\/\//g, '$1/');
    console.log(`🛡️ SATUS Service procesando: ${cleanUrl}`);

    const apiKey = this.configService.apiKeys.vt!;
    const urlBase64 = Buffer.from(cleanUrl).toString('base64').replace(/=/g, '');

    try {
      const vtReport = await this.fetchVTReport(urlBase64, apiKey);
      const aiAdvice = await this.getAiAdvice(cleanUrl, vtReport.details);

      return { ...vtReport, message: aiAdvice };

    } catch (error: any) {
      if (error.response?.status === 404) {
        console.log("📡 Link nuevo. Escaneando...");
        try {
          await firstValueFrom(
            this.httpService.post('https://www.virustotal.com',
              `url=${encodeURIComponent(cleanUrl)}`,
              { headers: { 'x-apikey': apiKey, 'Content-Type': 'application/x-www-form-urlencoded' } })
          );
          return { status: "processing", message: "🌀 Link nuevo en análisis. ¡Vuelve a tocar el escudo en 10 segundos!" };
        } catch (postError) {
          return { status: "error", message: "No se pudo iniciar el escaneo." };
        }
      }
      return { status: "error", message: "Error de comunicación con VirusTotal." };
    }
  }

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
