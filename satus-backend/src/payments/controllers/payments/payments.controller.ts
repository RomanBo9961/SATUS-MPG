import { Controller, Post, Body, Headers, Req, UseGuards, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { AuthService } from '../../../auth/services/auth.service';
import Stripe from 'stripe';

@Controller('payments')
export class PaymentsController {

    private stripe: Stripe;

    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService
    ) {
        // 🎯 SE INICIALIZA AQUÍ (Cuando el .env ya está cargado en la RAM)
        this.stripe = new Stripe(process.env['STRIPE_SECRET_KEY']!, {
            apiVersion: '2023-10-16' as any,
        });
    }

    //============== Endpoint de angular para saltar a Stripe ===================//
    @Post('create-checkout-session')
    @UseGuards(JwtAuthGuard)
    async createCheckoutSession(
        @Body() body: { userId: string; guestId: string; targetLicense: 'AVANZADO' | 'PRO' }
    ) {
        const { userId, guestId, targetLicense } = body;
        const priceAmountCentavos = targetLicense === 'AVANZADO' ? 320 : 500; // $3.2 o $5.0 USD calculado en centavo de dolar

        try {
            console.log(`💳 [NÚCLEO FINANCIERO]: Generando pasarela de suscripción para nodo [${userId || guestId}]...`);

            const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:4200';

            const session = await this.stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                mode: 'subscription',
                line_items: [
                    {
                        price_data: {
                            currency: 'usd',
                            product_data: {
                                name: `Licencia SATUS NÚCLEO - Nodo ${targetLicense}`,
                                description: 'Acceso total premium mensual y analítica heurística avanzada.',
                            },
                            unit_amount: priceAmountCentavos,
                            recurring: { interval: 'month' },
                        },
                        quantity: 1,
                    },
                ],
                //success_url: `http://localhost:4200/dashboard?status=success&session_id={CHECKOUT_SESSION_ID}`,
                success_url: `${frontendUrl}/dashboard?status=success&session_id={CHECKOUT_SESSION_ID}`,
                //cancel_url: `http://localhost:4200/pricing?status=cancelled`,
                cancel_url: `${frontendUrl}/pricing?status=cancelled`,
                metadata: {
                    userId: userId || 'GUEST',
                    guestId: guestId || 'NONE',
                    targetLicense: targetLicense,
                },
            });

            return { success: true, url: session.url };
        } catch (error: any) {
            console.error('🚨 [NÚCLEO FINANCIERO]: Colapso al procesar orden en Stripe:', error.message);
            throw new UnauthorizedException('La aduana bancaria rechazó la solicitud de pasarela.');
        }
    }



    //==================================== Receptor en WebHk ==============================//
    @Post('webhook')
    async handleStripeWebhook(@Headers('stripe-signature') sig: string, @Req() req: any) {

        const event = this.stripe.webhooks.constructEvent(req.rawBody, sig, process.env['STRIPE_WEBHOOK_SECRET']!);

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;

            const { userId, guestId, targetLicense } = session.metadata!;

            console.log(`💳 [WEBHOOK STRIPE]: Pago aprobado por el banco. Disparando mutación en el reactor Auth...`);

            const finalResult = await this.authService.processLicenseUpgrade(userId, guestId, targetLicense as any);

            console.log(`⚙️ [NÚCLEO]: Licencia inyectada con éxito mediante el puente de Stripe para: [${finalResult.username}]`);
        }

        return { received: true };
    }
}
