import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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
  public aiModelName = 'llama-3.1-8b-instant';

  constructor(
    private readonly httpService: HttpService,
    @Inject(config.KEY) private configService: ConfigType<typeof config>,
    @InjectModel(Detection.name) private detectionModel: Model<Detection>,
  ) {
    //this.genAI = new GoogleGenerativeAI(this.configService.apiKeys.ai!);
  }

  async analyzeUrl(url: string, userId: string) {
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
        owner: new Types.ObjectId(userId),
        createdAt: new Date()
      });

      await newRecord.save();
      console.log("✅ Análisis guardado en MongoDB");
      console.log("✅ Análisis guardado en MongoDB para el usuario:", userId);

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
            message: "¡Link nuevo identificado! SATUS lo está analizando. ¡Reintente en 10 segundos!"
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

      const promptText = `Actúa como analista experto de un sistema denominado SATUS. 
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
      Si el sitio es muy conocido, menciona su fiabilidad como fuente de información. Recuerda devolver el reporte con la URL traducida(que los caracteres sean equivalentes al lenguaje humano y no maquina)
      Nota: En reputación al lado del numero que imprimas (0 u otros) entre [] pon si es seguro(si ves que lleva tiempo desde su creacion), medianamente segura(si es nuevo), proceder con precaucion, peligroso, altamente peligroso y no entrar bajo ninguna circusntancia SEGUN CORRESPONDA`;

      const response = await axios.post(
        //`https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-lite-001:generateContent?key=${apiKey}`,
        apiUrl!,
        /* {
            contents: [{ parts: [{ text: promptText }] }]
          }*/
        {
          model: this.aiModelName,
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

  async findAll(userId: string,
    page: number = 1,
    limit: number = 10,
    search: string = '',
    risk: string = 'ALL') {
    const skip = (page - 1) * limit;

    // 2. filtro base 
    const query: any = { owner: new Types.ObjectId(userId) };

    // Si el Dashboard envía texto, activa búsqueda por URL
    if (search && search.trim() !== '') {
      query.url = { $regex: search, $options: 'i' }; // Búsqueda parcial e insensible a mayúsculas
    }

    // Filtro de Riesgo (Si no es ALL, filtra por ALTO/BAJO)
    if (risk !== 'ALL') {
      query.riskLevel = risk;
    }
    // Filtro para que devuelva lo del usuario logueado
    return this.detectionModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)              //  Salta registros de sectores anteriores
      .limit(limit)            // Trae tamaño del sector (10)
      .exec();
  }

  //METODO de detecc auto en NAVEGACION nodo PRO

  private async getBulkAiAdvice(links: string[]): Promise<string[]> {
    try {
      const apiKey = this.configService.apiKeys.ai;
      const apiUrl = this.configService.apiKeys.aiUrl;

      const promptText = `Actúa como un experto en ciberseguridad del sistema SATUS.
    Analiza la siguiente lista de URLs y determina cuáles presentan patrones de PHISHING, SUPLANTACIÓN o son sospechosas por viajar en HTTP y pedir datos sensibles.
    LISTA: ${links.join(', ')}
    
    INSTRUCCIONES:
    1. Evalúa TLDs sospechosos (.xyz, .tk, .click, etc).
    2. Busca suplantación de marcas (ej: g00gle, paypa1).
    3. Identifica keywords de urgencia o engaño en la ruta.
    
    RESPUESTA: Devuelve ÚNICAMENTE un array de JSON con las URLs que consideres peligrosas. 
    Ejemplo: ["http://url1.com", "http://url2.net"]. Si ninguna es peligrosa, devuelve [].`;

      const response = await axios.post(apiUrl!, {
        model: this.aiModelName,
        messages: [
          { role: "system", content: "Eres un detector de amenazas heurístico. Solo respondes con arrays JSON." },
          { role: "user", content: promptText }
        ],
        temperature: 0.1 // 👈 Temperatura baja para que sea preciso y no alucine
      }, {
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' }
      });

      const content = (response.data as any).choices[0].message.content;
      // Limpiamos la respuesta por si la IA añade texto extra
      const jsonMatch = content.match(/\[.*\]/s);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    } catch (e: any) {
      console.error("❌ Error en análisis masivo IA:", e.message);
      return []; // En caso de duda, no bloqueamos nada por error
    }
  }

  async checkIntegrity(url: string, userId: string) {
    const domain = new URL(url).hostname;
    const unaSemanaAtras = new Date();
    unaSemanaAtras.setDate(unaSemanaAtras.getDate() - 7);

    // 1. INTENTO DE RECUPERACIÓN DE CACHÉ 
    const cached = await this.detectionModel.findOne({
      url: { $regex: domain },
      updatedAt: { $gt: unaSemanaAtras }
    }).lean();

    if (cached) {
      console.log(`--- [CACHÉ] NODO CONOCIDO: ${domain} | RIESGO: ${cached.riskLevel}`);
      return {
        isSafe: cached.riskLevel === 'BAJO',
        blacklistedLinks: cached.details?.outbound_threats || []
      };
    }

    // 2. SI ES NUEVO O EXPIRÓ: ANÁLISIS DE CASCADA
    console.log(`--- [CASCADA] INVESTIGANDO NUEVO DOMINIO: ${domain}`);
    const apiKey = this.configService.apiKeys.vt!;
    const urlBase64 = Buffer.from(url).toString('base64').replace(/=/g, '');

    try {
      // P1: de VirusTotal se Obtiene stats y outbound_links
      const vtReport = await this.fetchVTReport(urlBase64, apiKey);

      // Extraer links maliciosos detectados por VT dentro de la web
      const outboundThreats = [];
      if (vtReport.details.info.outbound_links) {
        // Filtrar solo los que VT ya conoce como maliciosos
      }

      // P2: IA de SATUS 
      const aiAdvice = await this.getAiAdvice(url, vtReport.details);

      // 3. GUARDAR EN [detections]
      await this.detectionModel.create({
        url: domain,
        riskLevel: vtReport.riskLevel,
        message: aiAdvice,
        details: { ...vtReport.details, outbound_threats: outboundThreats },
        owner: new Types.ObjectId(userId)
      });

      return {
        isSafe: vtReport.riskLevel === 'BAJO',
        blacklistedLinks: outboundThreats
      };

    } catch (error) {
      // Si falla se asume que NO es zona segura
      return { isSafe: false, blacklistedLinks: [] };
    }
  }


  async bulkCheck(links: string[]) {
    const threats = [];
    const unknownLinks = [];

    // 1. FILTRO DE CACHÉ: Verificamos qué links ya conocemos como Malware
    for (const url of links) {
      const existing = await this.detectionModel.findOne({ url, riskLevel: 'ALTO' });
      if (existing) {
        threats.push(url);
      } else {
        unknownLinks.push(url);
      }
    }

    // 2. FILTRO HEURÍSTICO (Groq): Si hay links desconocidos, la IA decide si investigar
    if (unknownLinks.length > 0) {
      const aiIdentifiedThreats = await this.getBulkAiAdvice(unknownLinks);

      if (aiIdentifiedThreats.length > 0) {
        console.log(`⚠️ IA DETECTÓ ${aiIdentifiedThreats.length} AMENAZAS NUEVAS`);

        for (const url of aiIdentifiedThreats) {
          threats.push(url);

          // 💾 PERSISTENCIA: Alimentamos la Inteligencia Colectiva
          // Guardamos con un mensaje que indique que fue una detección proactiva
          await this.detectionModel.create({
            url: this.sanitizeAiResult(url),
            riskLevel: 'ALTO',
            message: '⚠️ BLOQUEO: Enlace identificado como amenaza potencial por el análisis heurístico del núcleo SATUS.',
            owner: new Types.ObjectId('660000000000000000000000'), // ID de Sistema/Invitado
            //createdAt: new Date()
          });
        }
      }
    }

    return { threats };
  }

  private sanitizeAiResult(rawResult: any): string {
    if (typeof rawResult === 'object' && rawResult !== null) {
      // Si la IA mandó un objeto, intentamos sacar la URL o lo convertimos a texto
      return rawResult.url || JSON.stringify(rawResult);
    }
    return String(rawResult);
  }

}
