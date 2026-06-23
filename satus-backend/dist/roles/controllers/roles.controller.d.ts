import { RolesService } from '../services/roles.service';
import { CreateRoleDto, UpdateRoleDto } from '../dtos/role.dto';
export declare class RolesController {
    private readonly rolesService;
    constructor(rolesService: RolesService);
    create(createRoleDto: CreateRoleDto): Promise<import("mongoose").Document<unknown, {}, import("../entities/role.entity").Role, {}, import("mongoose").DefaultSchemaOptions> & import("../entities/role.entity").Role & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    findAll(): Promise<(import("mongoose").Document<unknown, {}, import("../entities/role.entity").Role, {}, import("mongoose").DefaultSchemaOptions> & import("../entities/role.entity").Role & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, import("../entities/role.entity").Role, {}, import("mongoose").DefaultSchemaOptions> & import("../entities/role.entity").Role & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    update(id: string, updateRoleDto: UpdateRoleDto): Promise<import("mongoose").Document<unknown, {}, import("../entities/role.entity").Role, {}, import("mongoose").DefaultSchemaOptions> & import("../entities/role.entity").Role & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    remove(id: string): Promise<import("mongoose").Document<unknown, {}, import("../entities/role.entity").Role, {}, import("mongoose").DefaultSchemaOptions> & import("../entities/role.entity").Role & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
}
