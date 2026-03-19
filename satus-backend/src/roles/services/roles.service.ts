import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose'; 
import { Model, Types } from 'mongoose'; 
import { Role } from '../entities/role.entity';
import { CreateRoleDto, UpdateRoleDto } from '../dtos/role.dto';
import { ModulesService } from '../../modules/modules.service';

@Injectable()
export class RolesService {
    constructor(
        @InjectModel(Role.name) private roleModel: Model<Role>, // 🔹 Inyecta Mongo
        private modulesService: ModulesService
    ) { }

    async create(createRoleDto: CreateRoleDto) {
        const { moduleIds, ...rolesData } = createRoleDto;
        
        // Verifica si el nombre ya existe
        const existingRole = await this.roleModel.findOne({ name: rolesData.name }).exec();
        if (existingRole) {
            throw new BadRequestException('Role name already exists');
        }

        // Valida módulos
        const modules = await this.modulesService.findByIds(moduleIds);
        if (modules.length !== moduleIds.length) {
            throw new NotFoundException('Some modules were not found');
        }

        const newRole = new this.roleModel({
            ...rolesData,
            modules: moduleIds, // Guarda los ObjectIds
        });

        return await newRole.save();
    }

    async findAll() {
        return await this.roleModel.find().populate('modules').exec();
    }

    async findOne(id: string) {
        const role = await this.roleModel.findById(id).populate('modules').exec();
        if (!role) {
            throw new NotFoundException(`Role #${id} not found`);
        }
        return role;
    }

    async findByIds(roleIds: string[]) {
        // En Mongo se usa el operador $in para buscar múltiples IDs
        return await this.roleModel.find({
            _id: { $in: roleIds }
        }).exec();
    }

    async update(id: string, updateRoleDto: UpdateRoleDto) {
        const role = await this.roleModel.findById(id).exec();
        if (!role) throw new NotFoundException('Role not found');

        if (updateRoleDto.name) {
            const existingRole = await this.roleModel.findOne({ name: updateRoleDto.name }).exec();
            // Verifica que el nombre no lo tenga OTRO rol diferente al actual
            if (existingRole && existingRole._id.toString() !== id) {
                throw new BadRequestException('Role name already exists');
            }
        }

        if (updateRoleDto.moduleIds) {
            const modules = await this.modulesService.findByIds(updateRoleDto.moduleIds);
            if (modules.length !== updateRoleDto.moduleIds.length) {
                throw new NotFoundException('Some modules were not found');
            }
            role.set('modules', updateRoleDto.moduleIds);
        }

        role.set(updateRoleDto);
        return await role.save();
    }

    async remove(id: string) {
        // En Mongo, para ver si hay usuarios vinculados, 
        // necesitamos poblar la referencia inversa si la definimos o consultar Users.
        const role = await this.roleModel.findById(id).populate('users').exec();

        if (!role) {
            throw new NotFoundException(`Role #${id} not found`);
        }

        // Validamos si hay usuarios asignados
        if (role.users && role.users.length > 0) {
            throw new BadRequestException(
                `No se puede eliminar el rol: hay ${role.users.length} usuario(s) asignados a él.`
            );
        }

        return await this.roleModel.findByIdAndDelete(id).exec();
    }
}
