import { Document, Types } from 'mongoose';
export declare class ModuleEntity extends Document {
    name: string;
    description: string;
    roles: Types.ObjectId[];
}
export declare const ModuleSchema: import("mongoose").Schema<ModuleEntity, import("mongoose").Model<ModuleEntity, any, any, any, (Document<unknown, any, ModuleEntity, any, import("mongoose").DefaultSchemaOptions> & ModuleEntity & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, ModuleEntity, any, import("mongoose").DefaultSchemaOptions> & ModuleEntity & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}), any, ModuleEntity>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ModuleEntity, Document<unknown, {}, ModuleEntity, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<ModuleEntity & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    name?: import("mongoose").SchemaDefinitionProperty<string, ModuleEntity, Document<unknown, {}, ModuleEntity, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ModuleEntity & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    _id?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, ModuleEntity, Document<unknown, {}, ModuleEntity, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ModuleEntity & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    description?: import("mongoose").SchemaDefinitionProperty<string, ModuleEntity, Document<unknown, {}, ModuleEntity, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ModuleEntity & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    roles?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId[], ModuleEntity, Document<unknown, {}, ModuleEntity, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ModuleEntity & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
}, ModuleEntity>;
