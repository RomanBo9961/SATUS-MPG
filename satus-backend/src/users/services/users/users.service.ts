import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose'; // 🔹 Cambio clave
import { Model, Types } from 'mongoose'; // 🔹 Cambio clave
import { User } from 'src/users/entities/user.entity';
import { CreateUserDto, UpdateUserDto } from 'src/users/dtos/user.dto';
import { RolesService } from 'src/roles/services/roles.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>, // 🔹 Inyección de Mongo
        private rolesService: RolesService,
    ) { }

    async findAll() {
        // En Mongo se usa .populate() para traer las relaciones
        return await this.userModel.find().populate('roles').exec();
    }

    async findByEmail(email: string) {
        // Buscar y popular roles y sus módulos internos
        const user = await this.userModel.findOne({ email })
            .populate({
                path: 'roles',
                populate: { path: 'modules' }
            })
            .exec();

        if (!user) {
            throw new NotFoundException(`User ${email} not found`);
        }
        return user;
    }

    async findOne(userId: string) { // 🔹 Nota: En Mongo el ID es string (ObjectId)
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
