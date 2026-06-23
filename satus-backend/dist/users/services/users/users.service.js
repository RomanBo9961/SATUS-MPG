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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_entity_1 = require("../../../users/entities/user.entity");
const roles_service_1 = require("../../../roles/services/roles.service");
const bcrypt = __importStar(require("bcryptjs"));
let UsersService = class UsersService {
    constructor(userModel, rolesService) {
        this.userModel = userModel;
        this.rolesService = rolesService;
    }
    async inyectarRolManual(user) {
        if (user && user.roles && user.roles.length > 0) {
            const idCrudo = Array.isArray(user.roles) ? user.roles[0] : user.roles;
            const idLimpio = idCrudo.toString().match(/[0-9a-fA-F]{24}/)?.[0];
            if (idLimpio) {
                const roleData = await this.userModel.db.collection('roles').findOne({
                    $or: [
                        { _id: new mongoose_2.Types.ObjectId(idLimpio) },
                        { _id: idLimpio }
                    ]
                });
                if (roleData) {
                    user.roleName = roleData.name;
                    user.roles = [roleData];
                }
            }
        }
    }
    async findAll() {
        const users = await this.userModel.find().lean().exec();
        for (const user of users) {
            await this.inyectarRolManual(user);
        }
        return users;
    }
    async findByIdentifier(identifier) {
        try {
            const user = await this.userModel.findOne({
                $or: [{ email: identifier }, { username: identifier }]
            })
                .select('+password')
                .lean()
                .exec();
            if (user && user.roles && user.roles.length > 0) {
                const idCrudo = Array.isArray(user.roles) ? user.roles[0] : user.roles;
                const idLimpio = idCrudo.toString().match(/[0-9a-fA-F]{24}/)?.[0];
                console.log("ID RESTAURADO:", idLimpio);
                if (idLimpio) {
                    console.log(`--- [DEBUG] BUSCANDO ID: |${idLimpio}| (Largo: ${idLimpio.length})`);
                    const roleData = await this.userModel.db.collection('roles').findOne({
                        $or: [
                            { _id: new mongoose_2.Types.ObjectId(idLimpio) },
                            { _id: idLimpio }
                        ]
                    });
                    if (roleData) {
                        user.roleName = roleData.name;
                        user.roles = [roleData];
                        console.log(`--- [DB_RECO] ¡ÉXITO! ROL ENCONTRADO: ${roleData.name}`);
                    }
                    else {
                        const todosLosRoles = await this.userModel.db.collection('roles').find().toArray();
                        console.log("📋 IDs REALES EN TABLA ROLES:");
                        todosLosRoles.forEach((r) => {
                            const rid = r._id.toString();
                            console.log(`- |${rid}| (Largo: ${rid.length})`);
                        });
                    }
                }
            }
            return user;
        }
        catch (error) {
            console.error('--- [ERROR_DB] ---', error.message);
            throw error;
        }
    }
    async findOne(userId) {
        const user = await this.userModel.findById(userId).lean().exec();
        if (!user)
            throw new common_1.NotFoundException(`User #${userId} not found`);
        await this.inyectarRolManual(user);
        return user;
    }
    async create(createUserDto) {
        const { roleIds, password, ...userData } = createUserDto;
        console.log(`🕵️‍♂️ [LOG-CREATE 1] IDs recibidos en el DTO:`, roleIds);
        const hashedPassword = await bcrypt.hash(password, 10);
        const roles = await this.rolesService.findByIds(roleIds);
        console.log(`🕵️‍♂️ [LOG-CREATE 2] Roles encontrados físicamente en la DB por el servicio:`, roles);
        console.log(`🕵️‍♂️ [LOG-CREATE 3] Comparando largos -> Encontrados: ${roles.length} | Esperados: ${roleIds.length}`);
        if (roleIds && roleIds.length > 0 && roles.length !== roleIds.length) {
            throw new common_1.NotFoundException('Some roles were not found');
        }
        const newUser = new this.userModel({
            ...userData,
            password: hashedPassword
        });
        const rolesToAssign = roles && roles.length > 0
            ? roles.map(role => role._id)
            : ['660000000000000000000001'];
        newUser.set('roles', rolesToAssign);
        const savedUser = await newUser.save();
        return savedUser;
    }
    async updateUser(id, updateUserDto) {
        const { roleIds, password, ...userData } = updateUserDto;
        const user = await this.userModel.findById(id).exec();
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (roleIds) {
            const roles = await this.rolesService.findByIds(roleIds);
            if (roles.length !== roleIds.length) {
                throw new common_1.NotFoundException('Some roles were not found');
            }
            user.set('roles', roleIds);
        }
        if (password) {
            user.password = await bcrypt.hash(password, 10);
        }
        user.set(userData);
        return await user.save();
    }
    async deleteUser(idUser) {
        const result = await this.userModel.findByIdAndDelete(idUser).exec();
        if (!result)
            throw new common_1.NotFoundException(`User #${idUser} not found`);
        return result;
    }
    async findOrCreateGuest(guestId) {
        const fixedGuestObjectId = '660000000000000000000001';
        const technicalEmail = `${guestId.toLowerCase().trim()}@satus.local`;
        console.log(`📡 [NÚCLEO] Sintonizando persistencia para el terminal invitado: ${guestId}`);
        let guestUser = await this.userModel.findById(fixedGuestObjectId).lean().exec();
        if (!guestUser) {
            console.log(`✨ [MongoDB] Grabando nodo raíz físico '${fixedGuestObjectId}' asignado a: ${guestId}`);
            const hashedPassword = await bcrypt.hash(`GUEST_KEY_${guestId}`, 10);
            let guestRoleId = '660000000000000000000001';
            try {
                const guestRole = await this.rolesService.findOne('GUEST');
                if (guestRole && guestRole._id) {
                    guestRoleId = guestRole._id.toString();
                }
            }
            catch (error) {
                console.log('[NGXLOG] No se pudo recuperar el rol dinámico, usando respaldo fijo.');
            }
            guestUser = await this.userModel.create({
                _id: new mongoose_2.Types.ObjectId(fixedGuestObjectId),
                name: 'Invitado',
                lastName: 'SATUS',
                username: guestId,
                docType: 'GUEST',
                docNumber: guestId,
                email: technicalEmail,
                password: hashedPassword,
                isActive: true,
                roles: [guestRoleId]
            });
        }
        if (guestUser) {
            await this.inyectarRolManual(guestUser);
        }
        return guestUser;
    }
    async upgradeLicenseRange(userId, guestId, targetLicense) {
        let targetRoleId = '660000000000000000000003';
        let roleNameResponse = 'PROLicense';
        if (targetLicense === 'AVANZADO') {
            targetRoleId = '660000000000000000000002';
            roleNameResponse = 'AVZAccount';
        }
        try {
            const searchName = targetLicense === 'AVANZADO' ? 'AVZAccount' : 'PROLicense';
            const dbRole = await this.rolesService.findOne(searchName);
            if (dbRole && dbRole._id) {
                targetRoleId = dbRole._id.toString();
            }
        }
        catch (error) {
            console.log(`[MongoDB] No se pudo mapear el rol dinámico para ${targetLicense}, activando ID de contingencia física.`);
        }
        const userUpdated = await this.userModel.findByIdAndUpdate(userId, { $set: { roles: [targetRoleId] } }, { returnDocument: 'after' }).exec();
        if (!userUpdated)
            throw new common_1.NotFoundException('El analista objetivo no existe en la base de datos.');
        const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(guestId);
        if (isValidObjectId) {
            const technicalGuestId = new mongoose_2.Types.ObjectId(guestId);
            const userObjectId = new mongoose_2.Types.ObjectId(userId);
            const migrationResult = await this.userModel.db.collection('detections').updateMany({ owner: technicalGuestId, terminalId: guestId }, { $set: { owner: userObjectId, terminalId: null, updatedAt: new Date() } });
            console.log(`[MongoDB] Migración completa. ${migrationResult.modifiedCount} escaneos heredados al usuario real.`);
        }
        else {
            console.log(`⚠️ [PUENTE]: guestId analizado [${guestId}] no es una firma válida de MongoDB. Saltando herencia de escaneos.`);
        }
        return {
            success: true,
            message: `Aduana SATUS: Rango escalado a ${roleNameResponse} y escaneos vinculados con éxito.`,
            username: userUpdated.username || userUpdated.email,
            user_role: targetRoleId,
            newRoleName: roleNameResponse
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_entity_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        roles_service_1.RolesService])
], UsersService);
//# sourceMappingURL=users.service.js.map