import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose'; 
import { Model, Types } from 'mongoose'; 
import { User } from '../../../users/entities/user.entity';
import { CreateUserDto, UpdateUserDto } from '../../../users/dtos/user.dto';
import { RolesService } from '../../../roles/services/roles.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>, 
        private rolesService: RolesService,
    ) { }

    async findAll() {
        
        return await this.userModel.find().populate('roles').exec();
    }

    async findByIdentifier(identifier: string) {
console.log('--- [DEBUG] BUSCANDO EN MONGO POR:', identifier);

const dbName = this.userModel.db.name; 
console.log('--- [SONDA] EL BACKEND ESTÁ MIRANDO LA DB:', dbName);

const totalUsers = await this.userModel.countDocuments();
console.log('--- [SONDA] TOTAL DE USUARIOS EN ESTA DB:', totalUsers);

try {
    const user = await this.userModel.findOne({
    $or: [
        { email: identifier },
        { username: identifier }
    ]
    })
    .select('+password')
    .populate({
    path: 'roles',
    // .populate() para traer las relaciones
    populate: { path: 'modules' } 
    })
    .exec();

    if (!user) {
    console.log('--- [DEBUG] USUARIO NO ENCONTRADO EN DB');
    throw new NotFoundException(`User ${identifier} not found`);
    }

    console.log('--- [DEBUG] USUARIO ENCONTRADO:', user.username);
    return user;
} catch (error:any) {
    console.error('--- [ERROR CRÍTICO] FALLO EN CONSULTA MONGO:', error.message);
    throw error;
}
}

    async findOne(userId: string) { // 🔹 OJO!!: En Mongo el ID es string (ObjectId)
        const user = await this.userModel.findById(userId).populate('roles').exec();
        if (!user) {
            throw new NotFoundException(`User #${userId} not found`);
        }
        return user;
    }

    async create(createUserDto: CreateUserDto) {
        const { roleIds, password, ...userData } = createUserDto;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Buscamos los roles (ahora por ObjectId)
        const roles = await this.rolesService.findByIds(roleIds);

        if (roles.length !== roleIds.length) {
            throw new NotFoundException('Some roles were not found');
        }

        const newUser = new this.userModel({
            ...userData,
            password: hashedPassword,
            roles: roleIds, // Guarda las ref
        });
        
        return await newUser.save();
    }

    async updateUser(id: string, updateUserDto: UpdateUserDto) {
        const { roleIds, password, ...userData } = updateUserDto;
        
        const user = await this.userModel.findById(id).exec();
        if (!user) throw new NotFoundException('User not found');

        if (roleIds) {
            const roles = await this.rolesService.findByIds(roleIds);
            if (roles.length !== roleIds.length) {
                throw new NotFoundException('Some roles were not found');
            }
            user.set('roles', roleIds); // Actualizr array de ref
        }

        if (password) {
            user.password = await bcrypt.hash(password, 10);
        }

        // Merge manual para Mongo
        user.set(userData);

        return await user.save();
    }

    async deleteUser(idUser: string) {
        const result = await this.userModel.findByIdAndDelete(idUser).exec();
        if (!result) throw new NotFoundException(`User #${idUser} not found`);
        return result;
    }
}
