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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const modules_decorator_1 = require("../../../auth/decorators/modules.decorator");
const modules_guard_guard_1 = require("../../../auth/guards/modules.guard.guard");
const user_dto_1 = require("../../../users/dtos/user.dto");
const users_service_1 = require("../../../users/services/users/users.service");
const auth_guard_1 = require("../../../auth/guards/auth.guard");
let UsersController = class UsersController {
    constructor(usersService) {
        this.usersService = usersService;
    }
    getUsers() {
        return this.usersService.findAll();
    }
    getOne(userId) {
        return this.usersService.findOne(userId);
    }
    createUser(payload) {
        return this.usersService.create(payload);
    }
    updateUser(userId, payloadUpdated) {
        return this.usersService.updateUser(userId, payloadUpdated);
    }
    async deleteUser(userId) {
        return await this.usersService.deleteUser(userId);
    }
    async registerPublicNode(createUserDto) {
        const defaultRole = [];
        const nameBase = createUserDto.name ? createUserDto.name.toLowerCase().trim() : 'node';
        const generatedUsername = `${nameBase}_${Math.floor(Math.random() * 999)}`;
        const finalUserData = {
            ...createUserDto,
            username: generatedUsername,
            docType: createUserDto.docType || 'GUEST',
            docNumber: createUserDto.docNumber || 'PENDING_REG',
            lastName: createUserDto.lastName || 'SATUS'
        };
        return this.usersService.create({ ...finalUserData, roleIds: defaultRole });
    }
    async mutateUserRoleInCaliente(payload) {
        const { userId, targetTier } = payload;
        console.log(`⚡ [TORRE CONTROL] Comando de escalada recibido para el usuario: ${userId} -> Destino: ${targetTier}`);
        let targetRoleId = '660000000000000000000001';
        if (targetTier === 'PRO') {
            targetRoleId = '660000000000000000000003';
        }
        const userUpdated = await this.usersService.updateUser(userId, { roleIds: [targetRoleId] });
        return {
            success: true,
            message: `Aduana SATUS: Rango alterado correctamente a nivel de infraestructura.`,
            user: userUpdated
        };
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.JwtAuthGuard, modules_guard_guard_1.ModulesGuard),
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getUsers", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.JwtAuthGuard, modules_guard_guard_1.ModulesGuard),
    (0, common_1.Get)(':userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getOne", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.JwtAuthGuard, modules_guard_guard_1.ModulesGuard),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_dto_1.CreateUserDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "createUser", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.JwtAuthGuard, modules_guard_guard_1.ModulesGuard),
    (0, common_1.Put)(':userId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_dto_1.UpdateUserDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "updateUser", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.JwtAuthGuard, modules_guard_guard_1.ModulesGuard),
    (0, common_1.Delete)(':userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "deleteUser", null);
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "registerPublicNode", null);
__decorate([
    (0, common_1.Post)('admin/mutate-role'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "mutateUserRoleInCaliente", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('users'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, modules_decorator_1.Modules)('users'),
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map