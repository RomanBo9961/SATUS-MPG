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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DetectionsController = void 0;
const common_1 = require("@nestjs/common");
const detections_service_1 = require("./detections.service");
const auth_guard_1 = require("../auth/guards/auth.guard");
const jwt_1 = require("@nestjs/jwt");
let DetectionsController = class DetectionsController {
    constructor(detectionsService, jwtService) {
        this.detectionsService = detectionsService;
        this.jwtService = jwtService;
    }
    async getAll(req, page = 1, limit = 10, search = '', risk = 'ALL') {
        const userId = req.user._id;
        return this.detectionsService.findAll(userId, Number(page), Number(limit), search, risk);
    }
    async handleExtensionAnalysis(body, req) {
        const rawUrl = body.url;
        const userId = req.user._id;
        console.log(`📥 ESCANEO INICIADO POR USUARIO: ${userId}`);
        console.log("🔗 URL:", rawUrl);
        if (!rawUrl)
            return { status: "error", message: "No URL provided" };
        return this.detectionsService.analyzeUrl(rawUrl, userId);
    }
    async checkIntegrity(body, req) {
        const userId = this.extractUserIdFromHeader(req);
        console.log(`🛡️ VERIFICANDO INTEGRIDAD PERIMETRAL: ${body.url}`);
        return this.detectionsService.checkIntegrity(body.url, userId);
    }
    async bulkCheck(body, req) {
        const userId = this.extractUserIdFromHeader(req);
        const guestId = body.guestId || null;
        console.log(`🕵️ MODO CENTINELA ACTIVO: Analizando ráfaga de ${body.links.length} enlaces.`);
        return this.detectionsService.bulkCheck(body.links, userId, guestId);
    }
    async getGlobalStats() {
        return this.detectionsService.countGlobalDanger();
    }
    extractUserIdFromHeader(req) {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader === 'Bearer GUEST_TOKEN') {
                return null;
            }
            const token = authHeader.split(' ')[1];
            const decoded = this.jwtService.decode(token);
            return decoded?._id || decoded?.sub || null;
        }
        catch {
            return null;
        }
    }
};
exports.DetectionsController = DetectionsController;
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('search')),
    __param(4, (0, common_1.Query)('risk')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, String, String]),
    __metadata("design:returntype", Promise)
], DetectionsController.prototype, "getAll", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('scan'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], DetectionsController.prototype, "handleExtensionAnalysis", null);
__decorate([
    (0, common_1.Post)('check-integrity'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], DetectionsController.prototype, "checkIntegrity", null);
__decorate([
    (0, common_1.Post)('bulk-check'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], DetectionsController.prototype, "bulkCheck", null);
__decorate([
    (0, common_1.Get)('stats/global'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DetectionsController.prototype, "getGlobalStats", null);
exports.DetectionsController = DetectionsController = __decorate([
    (0, common_1.Controller)('detections'),
    __metadata("design:paramtypes", [detections_service_1.DetectionsService,
        jwt_1.JwtService])
], DetectionsController);
//# sourceMappingURL=detections.controller.js.map