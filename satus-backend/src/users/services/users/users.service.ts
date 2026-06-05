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

        console.log(`🕵️‍♂️ [LOG-CREATE 1] IDs recibidos en el DTO:`, roleIds);
        const hashedPassword = await bcrypt.hash(password, 10);

        // Buscamos los roles (ahora por ObjectId)
        const roles = await this.rolesService.findByIds(roleIds);

        console.log(`🕵️‍♂️ [LOG-CREATE 2] Roles encontrados físicamente en la DB por el servicio:`, roles);
        console.log(`🕵️‍♂️ [LOG-CREATE 3] Comparando largos -> Encontrados: ${roles.length} | Esperados: ${roleIds.length}`);

        if (roleIds && roleIds.length > 0 && roles.length !== roleIds.length) {
            throw new NotFoundException('Some roles were not found');
        }

        const newUser = new this.userModel({
            ...userData,
            password: hashedPassword
        });

        newUser.set('roles', ['660000000000000000000001']);

        const savedUser = await newUser.save();
        return savedUser;
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

    async findOrCreateGuest(guestId: string) {
        const fixedGuestObjectId = '660000000000000000000001';
        const technicalEmail = `${guestId.toLowerCase().trim()}@satus.local`;

        console.log(`📡 [NÚCLEO] Sintonizando persistencia para el terminal invitado: ${guestId}`);

        // 1. INTENTAR RESCATE DIRECTO: Buscamos por la clave primaria hexadecimal rígida [google:1]
        let guestUser = await this.userModel.findById(fixedGuestObjectId).lean().exec();

        // 2. ADUANA DE CREACIÓN ÚNICA: Si la base de datos está vacía, se estampa el nodo raíz [INDEX]
        if (!guestUser) {
            console.log(`✨ [MongoDB] Grabando nodo raíz físico '${fixedGuestObjectId}' asignado a: ${guestId}`);

            const hashedPassword = await bcrypt.hash(`GUEST_KEY_${guestId}`, 10);

            // Creamos e insertamos el documento en un solo ciclo 
            guestUser = await this.userModel.create({
                _id: new Types.ObjectId(fixedGuestObjectId),
                name: 'Invitado',
                lastName: 'SATUS',
                username: guestId, // Mantiene el nombre dinámico GUEST_ZS8RW4 
                docType: 'GUEST',
                docNumber: guestId,
                email: technicalEmail,
                password: hashedPassword,
                isActive: true,
                roles: ['660000000000000000000001'] // Rol FREEDefault indexado
            });
        }

        // Inyectamos el rol a la RAM 
        if (guestUser) {
            await this.inyectarRolManual(guestUser);
        }

        return guestUser;
    }

    //metodo UPGRADE para roles / MIGRACION escaneos entre roles

    async upgradeToPro(userId: string, guestId: string) {
        console.log(` [ASCENSO A PRO] Iniciando escalamiento seguro a PROLicense para el usuario: ${userId}`);
        console.log(` [MUDA DE ESCANEOS] Se heredarán los escaneos del dispositivo: ${guestId}`);

        // Actualizar el rol del usuario real a PROLicense 
        const proRoleId = '660000000000000000000003';
        const userUpdated = await this.userModel.findByIdAndUpdate(
            userId,
            { $set: { roles: [proRoleId] } },
            { new: true }
        ).lean().exec();

        if (!userUpdated) throw new NotFoundException('El analista objetivo no existe en la base de datos.');

        // Migracion de los registros 
        const technicalGuestId = new Types.ObjectId('660000000000000000000001');
        const userObjectId = new Types.ObjectId(userId);

        const migrationResult = await this.userModel.db.collection('detections').updateMany(
            { owner: technicalGuestId, terminalId: guestId },
            { $set: { owner: userObjectId, terminalId: null, updatedAt: new Date() } }
        );

        console.log(`📝 [MongoDB] Migración completa. ${migrationResult.modifiedCount} escaneos heredados al usuario real.`);

        // Restaurar el rol en memoria 
        await this.inyectarRolManual(userUpdated);

        return {
            success: true,
            message: 'Aduana SATUS: Rango escalado a PROLicense y escaneos vinculados con éxito.',
            user: {
                username: (userUpdated as any).username || (userUpdated as any).email,
                role: (userUpdated as any).roleName || 'PROLicense'
            }
        };
    }
}
