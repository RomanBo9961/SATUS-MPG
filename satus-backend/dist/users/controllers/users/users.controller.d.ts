import { CreateUserDto, UpdateUserDto } from '../../../users/dtos/user.dto';
import { UsersService } from '../../../users/services/users/users.service';
import { Types } from 'mongoose';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    getUsers(): Promise<(import("../../entities/user.entity").User & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getOne(userId: string): Promise<import("../../entities/user.entity").User & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    createUser(payload: CreateUserDto): Promise<import("mongoose").Document<unknown, {}, import("../../entities/user.entity").User, {}, import("mongoose").DefaultSchemaOptions> & import("../../entities/user.entity").User & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    updateUser(userId: string, payloadUpdated: UpdateUserDto): Promise<import("mongoose").Document<unknown, {}, import("../../entities/user.entity").User, {}, import("mongoose").DefaultSchemaOptions> & import("../../entities/user.entity").User & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    deleteUser(userId: string): Promise<import("mongoose").Document<unknown, {}, import("../../entities/user.entity").User, {}, import("mongoose").DefaultSchemaOptions> & import("../../entities/user.entity").User & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    registerPublicNode(createUserDto: any): Promise<import("mongoose").Document<unknown, {}, import("../../entities/user.entity").User, {}, import("mongoose").DefaultSchemaOptions> & import("../../entities/user.entity").User & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    mutateUserRoleInCaliente(payload: {
        userId: string;
        targetTier: 'FREE' | 'PRO';
    }): Promise<{
        success: boolean;
        message: string;
        user: import("mongoose").Document<unknown, {}, import("../../entities/user.entity").User, {}, import("mongoose").DefaultSchemaOptions> & import("../../entities/user.entity").User & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        };
    }>;
}
