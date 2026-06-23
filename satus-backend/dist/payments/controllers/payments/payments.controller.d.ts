import { AuthService } from '../../../auth/services/auth.service';
export declare class PaymentsController {
    private readonly authService;
    private stripe;
    constructor(authService: AuthService);
    createCheckoutSession(body: {
        userId: string;
        guestId: string;
        targetLicense: 'AVANZADO' | 'PRO';
    }): Promise<{
        success: boolean;
        url: string;
    }>;
    handleStripeWebhook(sig: string, req: any): Promise<{
        received: boolean;
    }>;
}
