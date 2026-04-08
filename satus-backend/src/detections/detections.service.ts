import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose'; 
import { Model } from 'mongoose';  
import { Detection } from './entities/detection.entity';             
import { HttpService } from '@nestjs/axios';
import type { ConfigType } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
//import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../config';
import axios from 'axios';

@Injectable()
export class DetectionsService {
  //private genAI: GoogleGenerativeAI;

  constructor(
    private readonly httpService: HttpService,
    @Inject(config.KEY) private configService: ConfigType<typeof config>,
  
     @InjectModel(Detection.name) private detectionModel: Model<Detection>,
  ) {
    //this.genAI = new GoogleGenerativeAI(this.configService.apiKeys.ai!);
  }

  async analyzeUrl(url: string) {
    const cleanUrl = url.trim();
    console.log("1. LLEGADA AL SERVICE:", cleanUrl);

    //------------------------Escaner Modelos AI [IMPORTANTE] ----------------------//

    /* try {
      const modelsList = await axios.get(`https://generativelanguage.googleapis.com/v1/models?key=${this.configService.apiKeys.ai}`);
      console.log("📋 MODELOS DISPONIBLES PARA TU KEY:", modelsList.data.models.map(m => m.name));
    } catch (err) {
      console.error("❌ No pude listar los modelos:", err.message);
    }*/

    //-----------------------------------------------------------------//

    const apiKey = this.configService.apiKeys.vt!;
    const urlBase64 = Buffer.from(cleanUrl).toString('base64').replace(/=/g, '');

    try {
      // 1. INTENTAR CONSULTA (GET)
      const vtReport = await this.fetchVTReport(urlBase64, apiKey);
      const aiAdvice = await this.getAiAdvice(cleanUrl, vtReport.details);
      
        const newRecord = new this.detectionModel({
    url: cleanUrl,
    riskLevel: vtReport.riskLevel,
    message: aiAdvice,
    details: vtReport.details,
    createdAt: new Date() 
  });
  
  await newRecord.save(); 
  console.log("✅ Análisis guardado en MongoDB");  
      
      return { ...vtReport, message: aiAdvice };

  } catch (error: any) {
      if (error.response?.status === 404) {
        console.log("📡 Link nuevo detectado. Enviando a escaneo...");
        try {
          // RUTA API VT
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
    const apiKey = this.configService.apiKeys.ai;
    const apiUrl = this.configService.apiKeys.aiUrl;

    const stats = details.stats;
    const info = details.info;
    const reputacion = info.reputation || 0;
    const categorias = info.categories ? Object.values(info.categories).join(", ") : "General / Información";

    const promptText = `Actúa como un analista experto de SATUS. 
    Analiza el enlace: ${url}
    DATOS TÉCNICOS:
    - Detecciones Maliciosas: ${stats.malicious} de ${stats.malicious + stats.harmless}
    - Reputación: ${reputacion}
    - Categoría: ${categorias}

      INSTRUCCIONES:
      Escribe un reporte humanizado que pueda comprender un usuario normal de internet y que a la vez luzca profesional (entre 30 y 50 palabras). 
      PRIORIDAD MÁXIMA: Si 'stats.malicious' es mayor a 0, debes iniciar el reporte con una ADVERTENCIA CLARA, sin importar la reputación del dominio.
      Si es 0 indicale que el sitio u archivo(segun corresponda) no tiene antecedentes, que es seguro en la medida de que no sea nuevo por que si lo es puede ser malicioso. 
      Explica que, aunque el sitio/archivo no sea corrupto, se han detectado elementos peligrosos y enuncialos, sino todos por lo menos los mas relevantes(explicalos de ser posible). 
      No digas solo "es seguro". Explica que la decisión se basa en la 
      reputación del dominio y la ausencia (o presencia) de malware u otros. 
      Ademas ten en cuenta que terminos como "pishing" o "scammer" son desconocidos para el usuario normal en consecuencia debes explicar como, por ejemplo, "este sitio no 
      almacenara sus datos bancarios o contraseñas" o "este archivo no comprometera la integridad de los datos en su pc o robara contraseñas), segùn el caso. De detectar que si lo haría, debes explicar que y como.
      Si el sitio es muy conocido, menciona su fiabilidad como fuente de información.`;

        const response = await axios.post(
      //`https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-lite-001:generateContent?key=${apiKey}`,
      apiUrl!,
     /* {
        contents: [{ parts: [{ text: promptText }] }]
      }*/
{
        model: "llama-3.1-8b-instant", 
        messages: [
          { role: "system", content: "Eres un analista de ciberseguridad de la plataforma SATUS." },
          { role: "user", content: promptText }
        ],
        temperature: 0.5
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }

    );

   const text = response.data.choices[0].message.content;
    //const text = response.data.candidates[0].content.parts[0].text;

    if (!text) throw new Error("No se pudo obtener el texto de la IA");
    
    return text;

  } catch (e: any) {
    console.error("❌ Error directo en traducción:", e.response?.data || e.message);
    
    const malicious = details.stats?.malicious || 0;
    const harmless = details.stats?.harmless || 0;

    if (malicious > 0) {
      return `⚠️ ALERTA TÉCNICA: ${malicious} motores de seguridad detectaron amenazas. Evita ingresar a este sitio.`;
    } else {
      return `✅ VERIFICACIÓN TÉCNICA: Analizado por ${harmless} motores de seguridad. No se detectó malware, Sin embargo el reporte detallado no está disponible o no es accesible en este momento.`;
    }
  }
 }

 async findAll() {
  // Asegúrate de que 'detectionModel' sea el nombre de tu modelo de Mongoose
  return this.detectionModel.find().sort({ createdAt: -1 }).exec();
}

}
