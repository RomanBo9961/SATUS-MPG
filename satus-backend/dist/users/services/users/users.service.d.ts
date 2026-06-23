import { Model, Types } from 'mongoose';
import { User } from '../../../users/entities/user.entity';
import { CreateUserDto, UpdateUserDto } from '../../../users/dtos/user.dto';
import { RolesService } from '../../../roles/services/roles.service';
export declare class UsersService {
    private userModel;
    private rolesService;
    constructor(userModel: Model<User>, rolesService: RolesService);
    private inyectarRolManual;
    findAll(): Promise<(User & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findByIdentifier(identifier: string): Promise<User & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    findOne(userId: string): Promise<User & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    create(createUserDto: CreateUserDto): Promise<import("mongoose").Document<unknown, {}, User, {}, import("mongoose").DefaultSchemaOptions> & User & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    updateUser(id: string, updateUserDto: UpdateUserDto): Promise<import("mongoose").Document<unknown, {}, User, {}, import("mongoose").DefaultSchemaOptions> & User & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    deleteUser(idUser: string): Promise<import("mongoose").Document<unknown, {}, User, {}, import("mongoose").DefaultSchemaOptions> & User & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    findOrCreateGuest(guestId: string): Promise<User & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    upgradeLicenseRange(userId: string, guestId: string, targetLicense: 'AVANZADO' | 'PRO'): Promise<{
        success: boolean;
        message: string;
        username: any;
        user_role: string;
        newRoleName: string;
    }>;
}
