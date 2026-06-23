import { Model, Types } from 'mongoose';
import { Role } from '../entities/role.entity';
import { CreateRoleDto, UpdateRoleDto } from '../dtos/role.dto';
import { ModulesService } from '../../modules/modules.service';
export declare class RolesService {
    private roleModel;
    private modulesService;
    constructor(roleModel: Model<Role>, modulesService: ModulesService);
    create(createRoleDto: CreateRoleDto): Promise<import("mongoose").Document<unknown, {}, Role, {}, import("mongoose").DefaultSchemaOptions> & Role & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    findAll(): Promise<(import("mongoose").Document<unknown, {}, Role, {}, import("mongoose").DefaultSchemaOptions> & Role & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, Role, {}, import("mongoose").DefaultSchemaOptions> & Role & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    findByIds(roleIds: string[]): Promise<(import("mongoose").Document<unknown, {}, Role, {}, import("mongoose").DefaultSchemaOptions> & Role & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    update(id: string, updateRoleDto: UpdateRoleDto): Promise<import("mongoose").Document<unknown, {}, Role, {}, import("mongoose").DefaultSchemaOptions> & Role & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    remove(id: string): Promise<import("mongoose").Document<unknown, {}, Role, {}, import("mongoose").DefaultSchemaOptions> & Role & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
}
