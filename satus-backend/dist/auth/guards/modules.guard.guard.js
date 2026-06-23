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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModulesGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
let ModulesGuard = class ModulesGuard {
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const requiredModules = this.reflector.get('modules', context.getHandler()) ||
            this.reflector.get('modules', context.getClass());
        if (!requiredModules || requiredModules.length === 0)
            return true;
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (user && (user.role === 'SUPAdmin' || user.roleName === 'SUPAdmin')) {
            console.log(`👑 [ModulesGuard] Acceso concedido: ${user.username}`);
            return true;
        }
        if (!user?.roles?.length) {
            throw new common_1.ForbiddenException('No roles assigned');
        }
        const hasModule = user.roles.some(role => role.modules?.some(m => requiredModules.includes(m.name)));
        if (!hasModule) {
            throw new common_1.ForbiddenException(`Missing required module: ${requiredModules}`);
        }
        return true;
    }
};
exports.ModulesGuard = ModulesGuard;
exports.ModulesGuard = ModulesGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], ModulesGuard);
//# sourceMappingURL=modules.guard.guard.js.map