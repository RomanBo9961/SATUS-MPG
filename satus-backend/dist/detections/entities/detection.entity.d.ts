import { Document, Types } from 'mongoose';
export declare class Detection extends Document {
    url: string;
    riskLevel: string;
    message: string;
    details: any;
    owner: Types.ObjectId;
    terminalId: string;
}
export declare const DetectionSchema: import("mongoose").Schema<Detection, import("mongoose").Model<Detection, any, any, any, (Document<unknown, any, Detection, any, import("mongoose").DefaultSchemaOptions> & Detection & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, Detection, any, import("mongoose").DefaultSchemaOptions> & Detection & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}), any, Detection>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Detection, Document<unknown, {}, Detection, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Detection & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    _id?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Detection, Document<unknown, {}, Detection, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Detection & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    message?: import("mongoose").SchemaDefinitionProperty<string, Detection, Document<unknown, {}, Detection, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Detection & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    owner?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Detection, Document<unknown, {}, Detection, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Detection & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    terminalId?: import("mongoose").SchemaDefinitionProperty<string, Detection, Document<unknown, {}, Detection, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Detection & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    url?: import("mongoose").SchemaDefinitionProperty<string, Detection, Document<unknown, {}, Detection, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Detection & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    riskLevel?: import("mongoose").SchemaDefinitionProperty<string, Detection, Document<unknown, {}, Detection, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Detection & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    details?: import("mongoose").SchemaDefinitionProperty<any, Detection, Document<unknown, {}, Detection, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Detection & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
}, Detection>;
