import { DetectionsService } from './detections.service';
import { JwtService } from '@nestjs/jwt';
export declare class DetectionsController {
    private readonly detectionsService;
    private readonly jwtService;
    constructor(detectionsService: DetectionsService, jwtService: JwtService);
    getAll(req: any, page?: number, limit?: number, search?: string, risk?: string): Promise<(import("mongoose").Document<unknown, {}, import("./entities/detection.entity").Detection, {}, import("mongoose").DefaultSchemaOptions> & import("./entities/detection.entity").Detection & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    handleExtensionAnalysis(body: any, req: any): Promise<{
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
    checkIntegrity(body: {
        url: string;
    }, req: any): Promise<{
        isSafe: boolean;
        blacklistedLinks: any;
    }>;
    bulkCheck(body: {
        links: string[];
        guestId?: string;
    }, req: any): Promise<{
        threats: any[];
    }>;
    getGlobalStats(): Promise<{
        totalDanger: number;
    }>;
    private extractUserIdFromHeader;
}
