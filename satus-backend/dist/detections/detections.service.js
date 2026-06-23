"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DetectionsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const detection_entity_1 = require("./entities/detection.entity");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
const config_1 = __importDefault(require("../config"));
const axios_2 = __importDefault(require("axios"));
let DetectionsService = class DetectionsService {
    constructor(httpService, configService, detectionModel) {
        this.httpService = httpService;
        this.configService = configService;
        this.detectionModel = detectionModel;
        this.aiModelName = 'llama-3.1-8b-instant';
    }
    async analyzeUrl(url, userId) {
        const cleanUrl = url.trim();
        console.log("1. LLEGADA AL SERVICE:", cleanUrl);
        const sanitizedUrl = cleanUrl.replace(/\/$/, '');
        const placeholderThreat = await this.detectionModel.findOne({
            url: { $in: [sanitizedUrl, `${sanitizedUrl}/`] }
        }).lean();
        if (placeholderThreat && (!placeholderThreat.details || !placeholderThreat.details.stats)) {
            console.log(`🗑️ [REESCRITURA] Registro automático incompleto detectado para: ${cleanUrl}. Purgando para análisis profundo...`);
            await this.detectionModel.deleteOne({ _id: placeholderThreat._id });
        }
        const apiKey = this.configService.apiKeys.vt;
        const urlBase64 = Buffer.from(cleanUrl).toString('base64').replace(/=/g, '');
        try {
            const vtReport = await this.fetchVTReport(urlBase64, apiKey);
            const aiAdvice = await this.getAiAdvice(cleanUrl, vtReport.details);
            const newRecord = new this.detectionModel({
                url: cleanUrl,
                riskLevel: vtReport.riskLevel,
                message: aiAdvice,
                details: vtReport.details,
                owner: new mongoose_2.Types.ObjectId(userId),
                createdAt: new Date()
            });
            await newRecord.save();
            console.log("✅ Análisis guardado en MongoDB");
            console.log("✅ Análisis guardado en MongoDB para el usuario:", userId);
            return { ...vtReport, status: aiAdvice, message: aiAdvice };
        }
        catch (error) {
            if (error.response?.status === 404) {
                console.log("📡 Link nuevo detectado. Enviando a escaneo...");
                try {
                    const vtEndpoint = 'https://www.virustotal.com/api/v3/urls';
                    const body = new URLSearchParams();
                    body.append('url', cleanUrl);
                    await (0, rxjs_1.firstValueFrom)(this.httpService.post(vtEndpoint, body.toString(), {
                        headers: {
                            'x-apikey': apiKey,
                            'Content-Type': 'application/x-www-form-urlencoded'
                        }
                    }));
                    return {
                        status: "processing",
                        message: "¡Link nuevo identificado! SATUS lo está analizando. ¡Reintente en 10 segundos!"
                    };
                }
                catch (postError) {
                    console.error("❌ ERROR POST VT:", postError.response?.data || postError.message);
                    return { status: "error", message: "No se pudo iniciar el escaneo." };
                }
            }
            return { status: "error", message: "Error de comunicación con la inteligencia." };
        }
    }
    async fetchVTReport(urlBase64, apiKey) {
        const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`https://www.virustotal.com/api/v3/urls/${urlBase64}`, {
            headers: { 'x-apikey': apiKey }
        }));
        const attributes = response.data.data.attributes;
        const stats = attributes.last_analysis_stats;
        return {
            status: "success",
            riskLevel: stats.malicious > 0 ? "ALTO" : "BAJO",
            details: {
                stats: stats,
                info: attributes,
                lastAnalysis: attributes.last_analysis_results
            }
        };
    }
    async getAiAdvice(url, details) {
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
            const response = await axios_2.default.post(apiUrl, {
                model: this.aiModelName,
                messages: [
                    { role: "system", content: "Eres un analista de ciberseguridad de la plataforma SATUS." },
                    { role: "user", content: promptText }
                ],
                temperature: 0.5
            }, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            const text = response.data.choices[0].message.content;
            if (!text)
                throw new Error("No se pudo obtener el texto de la IA");
            return text;
        }
        catch (e) {
            console.error("❌ Error directo en traducción:", e.response?.data || e.message);
            const malicious = details.stats?.malicious || 0;
            const harmless = details.stats?.harmless || 0;
            if (malicious > 0) {
                return `⚠️ ALERTA TÉCNICA: ${malicious} motores de seguridad detectaron amenazas. Evita ingresar a este sitio.`;
            }
            else {
                return `✅ VERIFICACIÓN TÉCNICA: Analizado por ${harmless} motores de seguridad. No se detectó malware, Sin embargo el reporte detallado no está disponible o no es accesible en este momento.`;
            }
        }
    }
    async findAll(userId, page = 1, limit = 10, search = '', risk = 'ALL') {
        const skip = (page - 1) * limit;
        const query = { owner: new mongoose_2.Types.ObjectId(userId) };
        if (search && search.trim() !== '') {
            query.url = { $regex: search, $options: 'i' };
        }
        if (risk !== 'ALL') {
            query.riskLevel = risk;
        }
        return this.detectionModel
            .find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .exec();
    }
    async getBulkAiAdvice(links) {
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
            const response = await axios_2.default.post(apiUrl, {
                model: this.aiModelName,
                messages: [
                    { role: "system", content: "Eres un detector de amenazas heurístico. Solo respondes con arrays JSON." },
                    { role: "user", content: promptText }
                ],
                temperature: 0.1
            }, {
                headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' }
            });
            const content = response.data.choices[0].message.content;
            const jsonMatch = content.match(/\[.*\]/s);
            return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
        }
        catch (e) {
            console.error("❌ Error en análisis masivo IA:", e.message);
            return [];
        }
    }
    async checkIntegrity(url, userId) {
        const domain = new URL(url).hostname;
        const unaSemanaAtras = new Date();
        unaSemanaAtras.setDate(unaSemanaAtras.getDate() - 7);
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
        console.log(`--- [CASCADA] INVESTIGANDO NUEVO DOMINIO: ${domain}`);
        const apiKey = this.configService.apiKeys.vt;
        const urlBase64 = Buffer.from(url).toString('base64').replace(/=/g, '');
        try {
            const vtReport = await this.fetchVTReport(urlBase64, apiKey);
            const outboundThreats = [];
            if (vtReport.details.info.outbound_links) {
            }
            const aiAdvice = await this.getAiAdvice(url, vtReport.details);
            await this.detectionModel.create({
                url: domain,
                riskLevel: vtReport.riskLevel,
                message: aiAdvice,
                details: { ...vtReport.details, outbound_threats: outboundThreats },
                owner: new mongoose_2.Types.ObjectId(userId)
            });
            return {
                isSafe: vtReport.riskLevel === 'BAJO',
                blacklistedLinks: outboundThreats
            };
        }
        catch (error) {
            return { isSafe: false, blacklistedLinks: [] };
        }
    }
    async bulkCheck(links, userId = null, guestId = null) {
        const threats = [];
        const unknownLinks = [];
        for (const url of links) {
            const sanitizedUrl = url.replace(/\/$/, '');
            const existing = await this.detectionModel.findOne({
                url: { $in: [sanitizedUrl, `${sanitizedUrl}/`] },
                riskLevel: 'ALTO'
            }).lean();
            if (existing) {
                console.log(`🚨 [CENTINELA BACK] Amenaza confirmada en caché local: ${url}`);
                threats.push(url);
            }
            else {
                unknownLinks.push(url);
            }
        }
        if (unknownLinks.length > 0) {
            const aiIdentifiedThreats = await this.getBulkAiAdvice(unknownLinks);
            if (aiIdentifiedThreats.length > 0) {
                console.log(`⚠️ IA DETECTÓ ${aiIdentifiedThreats.length} AMENAZAS NUEVAS`);
                const finalOwnerId = userId ? new mongoose_2.Types.ObjectId(userId) : new mongoose_2.Types.ObjectId('660000000000000000000001');
                for (const url of aiIdentifiedThreats) {
                    threats.push(url);
                    await this.detectionModel.create({
                        url: this.sanitizeAiResult(url),
                        riskLevel: 'ALTO',
                        message: '⚠️ BLOQUEO: Enlace identificado como amenaza potencial por el análisis heurístico del núcleo SATUS.',
                        owner: finalOwnerId,
                        terminalId: userId ? null : guestId,
                    });
                }
            }
        }
        return { threats };
    }
    sanitizeAiResult(rawResult) {
        if (typeof rawResult === 'object' && rawResult !== null) {
            return rawResult.url || JSON.stringify(rawResult);
        }
        return String(rawResult);
    }
    async countGlobalDanger() {
        const totalDanger = await this.detectionModel.countDocuments({ riskLevel: 'ALTO' });
        return { totalDanger };
    }
};
exports.DetectionsService = DetectionsService;
exports.DetectionsService = DetectionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(config_1.default.KEY)),
    __param(2, (0, mongoose_1.InjectModel)(detection_entity_1.Detection.name)),
    __metadata("design:paramtypes", [axios_1.HttpService, void 0, mongoose_2.Model])
], DetectionsService);
//# sourceMappingURL=detections.service.js.map