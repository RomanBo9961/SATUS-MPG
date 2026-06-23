import { Model, Types } from 'mongoose';
import { Detection } from './entities/detection.entity';
import { HttpService } from '@nestjs/axios';
import type { ConfigType } from '@nestjs/config';
import config from '../config';
export declare class DetectionsService {
    private readonly httpService;
    private configService;
    private detectionModel;
    aiModelName: string;
    constructor(httpService: HttpService, configService: ConfigType<typeof config>, detectionModel: Model<Detection>);
    analyzeUrl(url: string, userId: string): Promise<{
        status: any;
        message: any;
        riskLevel: string;
        details: {
            stats: any;
            info: any;
            lastAnalysis: any;
        };
    } | {
        status: string;
        message: string;
    }>;
    private fetchVTReport;
    private getAiAdvice;
    findAll(userId: string, page?: number, limit?: number, search?: string, risk?: string): Promise<(import("mongoose").Document<unknown, {}, Detection, {}, import("mongoose").DefaultSchemaOptions> & Detection & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    private getBulkAiAdvice;
    checkIntegrity(url: string, userId: string): Promise<{
        isSafe: boolean;
        blacklistedLinks: any;
    }>;
    bulkCheck(links: string[], userId?: string | null, guestId?: string | null): Promise<{
        threats: any[];
    }>;
    private sanitizeAiResult;
    countGlobalDanger(): Promise<{
        totalDanger: number;
    }>;
}
