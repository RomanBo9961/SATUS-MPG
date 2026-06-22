/* eslint-disable prettier/prettier */
import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LoginDto } from '../dtos/login.dto';
import { AuthService } from '../services/auth.service';
import { JwtAuthGuard } from '../guards/auth.guard';
import { UsersService } from '../../users/services/users/users.service';
import { TelemetryGateway } from '../../telemetry/gateways/telemetry/telemetry.gateway';

@ApiTags('auth')
@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService,
        private readonly telemetryGateway: TelemetryGateway,
        private readonly usersService: UsersService) { }

    @Post('login')
    @ApiOperation({ summary: 'Inicio de sesión para obtener el token JWT' })
    async login(@Body() body: LoginDto) {
        // 1. Validacion de credenciales 
        const user = await this.authService.validateUser(
            body.email,
            body.password,
        );

        // 2. Genera el token (Any para evitar líos de interfaces id vs _id)
        return this.authService.login(user as any);
    }

    @Post('guest-sync')
    @ApiOperation({ summary: 'Sincronización y persistencia de nodos invitados de la Landing' })
    async syncGuestNode(@Body() body: { guestId: string }) {

        if (!body || !body.guestId) {
            return { status: 'error', message: 'ID de invitado ausente en el chasis de red.' };
        }

        // Envio del ID directo al servicio auth
        return this.authService.validateOrCreateGuestNode(body.guestId);
    }

    @UseGuards(JwtAuthGuard)
    @Post('upgrade-license')
    async upgradeToProAccount(@Request() req: any, @Body() body: { guestId: string; targetLicense: string }) {
        const userId = req.user._id;
        const { guestId, targetLicense } = body;

        if (!guestId) {
            return { success: false, message: 'Aduana SATUS: Identificador de terminal ausente.' };
        }

        // 🪒 Llamamos al servicio unificado
        return await this.authService.processLicenseUpgrade(userId, guestId, targetLicense as any);
    }

    @Post('test-telemetry')
    async triggerTestLog() {
        console.log('💥 [NÚCLEO]: Disparando ráfaga de prueba hacia el WebSocket...');

        // Invoca el método de la antena para lanzar el JSON 
        this.telemetryGateway.broadcastSystemLog({
            type: 'SECURITY_ALERT',
            message: '¡PERÍMETRO INTACTO! Conexión bidireccional NestJS-Angular verificada.',
            operator: 'SUPAdmin_Kernel'
        });

        return { success: true, status: 'Dardo de telemetría emitido con éxito.' };
    }
}

