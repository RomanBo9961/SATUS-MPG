"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const users_service_1 = require("../../users/services/users/users.service");
const bcrypt = __importStar(require("bcryptjs"));
const roles_service_1 = require("../../roles/services/roles.service");
const google_auth_library_1 = require("google-auth-library");
let AuthService = class AuthService {
    constructor(usersService, jwtService, rolesService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.rolesService = rolesService;
    }
    async validateUser(identifier, pass) {
        const user = await this.usersService.findByIdentifier(identifier);
        if (user) {
            const isMatch = await bcrypt.compare(pass, user.password);
            if (isMatch) {
                const roleName = user.roleName || 'FREE';
                console.log(`--- [SEGURIDAD] NODO VALIDADO: ${user.username} | RANGO: ${roleName} ---`);
                const { password, ...result } = user;
                return { ...result, roleName };
            }
        }
        throw new common_1.UnauthorizedException('Credenciales inválidas');
    }
    async login(user) {
        const payload = {
            username: user.username,
            sub: user._id,
            role: user.roleName
        };
        return {
            access_token: this.jwtService.sign(payload),
            role: user.roleName,
            username: user.username
        };
    }
    async validateGoogleToken(tokenPayload) {
        const client = new google_auth_library_1.OAuth2Client('://googleusercontent.com');
        try {
            const ticket = await client.verifyIdToken({
                idToken: tokenPayload,
                audience: '://googleusercontent.com',
            });
            const payload = ticket.getPayload();
            if (!payload)
                throw new Error('JWT de Google vacío o corrupto.');
            const { email, name, picture } = payload;
            let user = await this.usersService.findByIdentifier(email);
            if (!user) {
                console.log(`✨ [NÚCLEO] Detectado nuevo usuario vía Google. Registrando nodo: ${email}`);
                const cleanUsername = name.replace(/\s+/g, '_').toLowerCase() + '_' + Math.random().toString(36).substring(2, 5);
                user = await this.usersService.create({
                    name: name,
                    lastName: 'Estándar',
                    docType: 'CC',
                    docNumber: 'GOOGLE_BYPASS_' + Math.random().toString(36).substring(2, 6).toUpperCase(),
                    email: email,
                    password: 'GOOGLE_HARDWARE_KEY_' + Math.random().toString(36).substring(2, 10),
                    isActive: true,
                    roleIds: ['660000000000000000000001']
                });
                user.roleName = 'FREEDefault';
            }
            else {
                console.log(`🛰️ [NÚCLEO] Acceso concedido vía Google por Bypass para: ${user.name || user.username}`);
            }
            const finalRole = user.roleName || 'FREEDefault';
            const finalUsername = user.name || user.username || 'INVITADO';
            const satusToken = this.jwtService.sign({
                _id: user._id || user.id,
                username: finalUsername,
                role: finalRole
            });
            return {
                token: satusToken,
                role: finalRole,
                username: finalUsername
            };
        }
        catch (error) {
            console.error('🚨 [ADUANA BACKEND] Verificación criptográfica de Google fallida:', error.message);
            throw new Error('Credenciales de Google no válidas.');
        }
    }
    async validateOrCreateGuestNode(guestId) {
        const cleanGuestId = guestId.trim();
        const technicalEmail = `${cleanGuestId.toLowerCase()}@satus.local`;
        console.log(`🕵️‍♂️ [ADUANA GUEST] Auditando persistencia física para: ${technicalEmail}`);
        let guestUser = await this.usersService.findByIdentifier(technicalEmail);
        if (guestUser) {
            console.log(`📡 [ADUANA GUEST] Nodo existente detectado. Reutilizando expediente para: ${cleanGuestId}`);
        }
        else {
            console.log(`✨ [ADUANA GUEST] Inserción autorizada para canal inédito: ${cleanGuestId}`);
            guestUser = await this.usersService.findOrCreateGuest(cleanGuestId);
        }
        const mappedUser = {
            username: guestUser.username || cleanGuestId,
            _id: guestUser._id,
            roleName: guestUser.roleName || 'FREEDefault'
        };
        return this.login(mappedUser);
    }
    async processLicenseUpgrade(userId, guestId, targetLicense) {
        const migrationResult = await this.usersService.upgradeLicenseRange(userId, guestId, targetLicense);
        const newSessionToken = await this.login({
            _id: userId,
            username: migrationResult.username,
            roleName: migrationResult.newRoleName
        });
        return {
            ...migrationResult,
            token: newSessionToken.access_token
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        roles_service_1.RolesService])
], AuthService);
//# sourceMappingURL=auth.service.js.map