/* eslint-disable prettier/prettier */
import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LoginDto } from '../dtos/login.dto';
import { AuthService } from '../services/auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService) {}

    @Post('login')
    @ApiOperation({ summary: 'Inicio de sesión para obtener el token JWT' })
    async login(@Body() body: LoginDto) {
        // 1. Validamos credenciales (devuelve el usuario de Mongo)
        const user = await this.authService.validateUser(
            body.email,
            body.password,
        );

        // 2. Generamos el token (Pasamos como any para evitar líos de interfaces id vs _id)
        return this.authService.login(user as any);
    }
}
