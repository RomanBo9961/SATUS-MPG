import { Model } from 'mongoose';
import { ModuleEntity } from './entities/module.entity';
import { CreateModuleDto } from './dtos/create-module.dto';
export declare class ModulesService {
    private moduleModel;
    constructor(moduleModel: Model<ModuleEntity>);
    findByIds(ids: string[]): Promise<(import("mongoose").Document<unknown, {}, ModuleEntity, {}, import("mongoose").DefaultSchemaOptions> & ModuleEntity & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    create(dto: CreateModuleDto): Promise<import("mongoose").Document<unknown, {}, ModuleEntity, {}, import("mongoose").DefaultSchemaOptions> & ModuleEntity & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    findAll(): Promise<(import("mongoose").Document<unknown, {}, ModuleEntity, {}, import("mongoose").DefaultSchemaOptions> & ModuleEntity & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
}
