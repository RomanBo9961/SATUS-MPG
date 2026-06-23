import { LoginDto } from '../dtos/login.dto';
import { AuthService } from '../services/auth.service';
import { UsersService } from '../../users/services/users/users.service';
import { TelemetryGateway } from '../../telemetry/gateways/telemetry/telemetry.gateway';
export declare class AuthController {
    private readonly authService;
    private readonly telemetryGateway;
    private readonly usersService;
    constructor(authService: AuthService, telemetryGateway: TelemetryGateway, usersService: UsersService);
    login(body: LoginDto): Promise<{
        access_token: string;
        role: any;
        username: any;
    }>;
    syncGuestNode(body: {
        guestId: string;
    }): Promise<{
        access_token: string;
        role: any;
        username: any;
    } | {
        status: string;
        message: string;
    }>;
    upgradeToProAccount(req: any, body: {
        guestId: string;
        targetLicense: string;
    }): Promise<{
        token: string;
        success: boolean;
        message: string;
        username: any;
        user_role: string;
        newRoleName: string;
    } | {
        success: boolean;
        message: string;
    }>;
    triggerTestLog(): Promise<{
        success: boolean;
        status: string;
    }>;
}
