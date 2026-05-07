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

    private async inyectarRolManual(user: any) {
        if (user && user.roles && user.roles.length > 0) {
            const idCrudo = Array.isArray(user.roles) ? user.roles[0] : user.roles;
            const idLimpio = idCrudo.toString().match(/[0-9a-fA-F]{24}/)?.[0];

            if (idLimpio) {
                const roleData = await (this.userModel.db.collection('roles') as any).findOne({
                    $or: [
                        { _id: new Types.ObjectId(idLimpio) },
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
    async findByIdentifier(identifier: string) {
        try {
            // 1. Buscamos el usuario
            const user = await this.userModel.findOne({
                $or: [{ email: identifier }, { username: identifier }]
            })
                .select('+password')
                .lean() // Lo traemos plano para manipularlo
                .exec();

            if (user && user.roles && user.roles.length > 0) {
                const idCrudo = Array.isArray(user.roles) ? user.roles[0] : user.roles;

                //Extrae los 24 caracteres hexadecimales para hacer coincidir id
                const idLimpio = idCrudo.toString().match(/[0-9a-fA-F]{24}/)?.[0];

                console.log("ID RESTAURADO:", idLimpio);

                if (idLimpio) {
                    console.log(`--- [DEBUG] BUSCANDO ID: |${idLimpio}| (Largo: ${idLimpio.length})`);

                    // Usamos (as any) en el filtro para que TS no bloquee la compilación
                    const roleData = await (this.userModel.db.collection('roles') as any).findOne({
                        $or: [
                            { _id: new Types.ObjectId(idLimpio) },
                            { _id: idLimpio }
                        ]
                    });

                    if (roleData) {
                        (user as any).roleName = roleData.name;
                        user.roles = [roleData as any];
                        console.log(`--- [DB_RECO] ¡ÉXITO! ROL ENCONTRADO: ${roleData.name}`);
                    } else {
                        const todosLosRoles = await (this.userModel.db.collection('roles') as any).find().toArray();
                        console.log("📋 IDs REALES EN TABLA ROLES:");
                        todosLosRoles.forEach((r: any) => {
                            const rid = r._id.toString();
                            console.log(`- |${rid}| (Largo: ${rid.length})`);
                        });
                    }
                }
            }

            return user;
        } catch (error: any) {
            console.error('--- [ERROR_DB] ---', error.message);
            throw error;
        }
    }

    async findOne(userId: string) {
        const user = await this.userModel.findById(userId).lean().exec();
        if (!user) throw new NotFoundException(`User #${userId} not found`);
        await this.inyectarRolManual(user);
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
