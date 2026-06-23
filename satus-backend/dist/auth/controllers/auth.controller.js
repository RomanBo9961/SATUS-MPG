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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const login_dto_1 = require("../dtos/login.dto");
const auth_service_1 = require("../services/auth.service");
const auth_guard_1 = require("../guards/auth.guard");
const users_service_1 = require("../../users/services/users/users.service");
const telemetry_gateway_1 = require("../../telemetry/gateways/telemetry/telemetry.gateway");
let AuthController = class AuthController {
    constructor(authService, telemetryGateway, usersService) {
        this.authService = authService;
        this.telemetryGateway = telemetryGateway;
        this.usersService = usersService;
    }
    async login(body) {
        const user = await this.authService.validateUser(body.email, body.password);
        return this.authService.login(user);
    }
    async syncGuestNode(body) {
        if (!body || !body.guestId) {
            return { status: 'error', message: 'ID de invitado ausente en el chasis de red.' };
        }
        return this.authService.validateOrCreateGuestNode(body.guestId);
    }
    async upgradeToProAccount(req, body) {
        const userId = req.user._id;
        const { guestId, targetLicense } = body;
        if (!guestId) {
            return { success: false, message: 'Aduana SATUS: Identificador de terminal ausente.' };
        }
        return await this.authService.processLicenseUpgrade(userId, guestId, targetLicense);
    }
    async triggerTestLog() {
        console.log('💥 [NÚCLEO]: Disparando ráfaga de prueba hacia el WebSocket...');
        this.telemetryGateway.broadcastSystemLog({
            type: 'SECURITY_ALERT',
            message: '¡PERÍMETRO INTACTO! Conexión bidireccional NestJS-Angular verificada.',
            operator: 'SUPAdmin_Kernel'
        });
        return { success: true, status: 'Dardo de telemetría emitido con éxito.' };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('login'),
    (0, swagger_1.ApiOperation)({ summary: 'Inicio de sesión para obtener el token JWT' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('guest-sync'),
    (0, swagger_1.ApiOperation)({ summary: 'Sincronización y persistencia de nodos invitados de la Landing' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "syncGuestNode", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('upgrade-license'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "upgradeToProAccount", null);
__decorate([
    (0, common_1.Post)('test-telemetry'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "triggerTestLog", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('auth'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        telemetry_gateway_1.TelemetryGateway,
        users_service_1.UsersService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map