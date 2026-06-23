import { ModulesService } from './modules.service';
import { CreateModuleDto } from './dtos/create-module.dto';
export declare class ModulesController {
    private readonly modulesService;
    constructor(modulesService: ModulesService);
    create(dto: CreateModuleDto): Promise<import("mongoose").Document<unknown, {}, import("./entities/module.entity").ModuleEntity, {}, import("mongoose").DefaultSchemaOptions> & import("./entities/module.entity").ModuleEntity & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    findAll(): Promise<(import("mongoose").Document<unknown, {}, import("./entities/module.entity").ModuleEntity, {}, import("mongoose").DefaultSchemaOptions> & import("./entities/module.entity").ModuleEntity & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
}
