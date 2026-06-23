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
exports.RolesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const role_entity_1 = require("../entities/role.entity");
const modules_service_1 = require("../../modules/modules.service");
let RolesService = class RolesService {
    constructor(roleModel, modulesService) {
        this.roleModel = roleModel;
        this.modulesService = modulesService;
    }
    async create(createRoleDto) {
        const { moduleIds, ...rolesData } = createRoleDto;
        const existingRole = await this.roleModel.findOne({ name: rolesData.name }).exec();
        if (existingRole) {
            throw new common_1.BadRequestException('Role name already exists');
        }
        const modules = await this.modulesService.findByIds(moduleIds);
        if (modules.length !== moduleIds.length) {
            throw new common_1.NotFoundException('Some modules were not found');
        }
        const newRole = new this.roleModel({
            ...rolesData,
            modules: moduleIds,
        });
        return await newRole.save();
    }
    async findAll() {
        return await this.roleModel.find().populate('modules').exec();
    }
    async findOne(id) {
        const role = await this.roleModel.findById(id).populate('modules').exec();
        if (!role) {
            throw new common_1.NotFoundException(`Role #${id} not found`);
        }
        return role;
    }
    async findByIds(roleIds) {
        return await this.roleModel.find({
            _id: { $in: roleIds }
        }).exec();
    }
    async update(id, updateRoleDto) {
        const role = await this.roleModel.findById(id).exec();
        if (!role)
            throw new common_1.NotFoundException('Role not found');
        if (updateRoleDto.name) {
            const existingRole = await this.roleModel.findOne({ name: updateRoleDto.name }).exec();
            if (existingRole && existingRole._id.toString() !== id) {
                throw new common_1.BadRequestException('Role name already exists');
            }
        }
        if (updateRoleDto.moduleIds) {
            const modules = await this.modulesService.findByIds(updateRoleDto.moduleIds);
            if (modules.length !== updateRoleDto.moduleIds.length) {
                throw new common_1.NotFoundException('Some modules were not found');
            }
            role.set('modules', updateRoleDto.moduleIds);
        }
        role.set(updateRoleDto);
        return await role.save();
    }
    async remove(id) {
        const role = await this.roleModel.findById(id).populate('users').exec();
        if (!role) {
            throw new common_1.NotFoundException(`Role #${id} not found`);
        }
        if (role.users && role.users.length > 0) {
            throw new common_1.BadRequestException(`No se puede eliminar el rol: hay ${role.users.length} usuario(s) asignados a él.`);
        }
        return await this.roleModel.findByIdAndDelete(id).exec();
    }
};
exports.RolesService = RolesService;
exports.RolesService = RolesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(role_entity_1.Role.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        modules_service_1.ModulesService])
], RolesService);
//# sourceMappingURL=roles.service.js.map