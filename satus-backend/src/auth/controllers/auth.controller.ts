/* eslint-disable prettier/prettier */
import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LoginDto } from '../dtos/login.dto';
import { AuthService } from '../services/auth.service';
import { JwtAuthGuard } from '../guards/auth.guard';
import { UsersService } from '../../users/services/users/users.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService,
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
    @ApiOperation({ summary: 'Escalamiento de rango y migración masiva de escaneos históricos' })
    async upgradeToProAccount(
        @Request() req: any,
        @Body() body: { guestId: string }
    ) {
        const userId = req.user._id;
        const { guestId, targetLicense } = body as any;

        if (!guestId) {
            return { success: false, message: 'Aduana SATUS: Identificador de terminal ausente.' };
        }

        console.log(`📥 [COMPRA DETECTADA] Solicitud de escalamiento enviada por analista: ${userId}`);

        // Invoca el reactor UPGRADE del UsersService 
        const migrationResult = await this.usersService.upgradeLicenseRange(userId, guestId, targetLicense);

        // Firma de nueva credencial PRO 
        const newSessionToken = await this.authService.login({
            _id: userId,
            username: migrationResult.username,
            roleName: migrationResult.newRoleName
        });

        return {
            ...migrationResult,
            token: newSessionToken.access_token
        };
    }
}

