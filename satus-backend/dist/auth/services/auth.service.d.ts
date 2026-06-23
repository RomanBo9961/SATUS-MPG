import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/services/users/users.service';
import { RolesService } from '../../roles/services/roles.service';
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    private readonly rolesService;
    constructor(usersService: UsersService, jwtService: JwtService, rolesService: RolesService);
    validateUser(identifier: string, pass: string): Promise<{
        roleName: any;
        name: string;
        lastName: string;
        docType: string;
        docNumber: string;
        email: string;
        username: string;
        isActive: boolean;
        roles: import("mongoose").Types.ObjectId[];
        _id: import("mongoose").Types.ObjectId;
        $locals: Record<string, unknown>;
        $op: "save" | "validate" | "remove" | null;
        $where: Record<string, unknown>;
        baseModelName?: string;
        collection: import("mongoose").Collection;
        db: import("mongoose").Connection;
        errors?: import("mongoose").Error.ValidationError;
        isNew: boolean;
        schema: import("mongoose").Schema;
        __v: number;
    }>;
    login(user: any): Promise<{
        access_token: string;
        role: any;
        username: any;
    }>;
    validateGoogleToken(tokenPayload: string): Promise<{
        token: string;
        role: any;
        username: any;
    }>;
    validateOrCreateGuestNode(guestId: string): Promise<{
        access_token: string;
        role: any;
        username: any;
    }>;
    processLicenseUpgrade(userId: string, guestId: string, targetLicense: 'AVANZADO' | 'PRO'): Promise<{
        token: string;
        success: boolean;
        message: string;
        username: any;
        user_role: string;
        newRoleName: string;
    }>;
}
