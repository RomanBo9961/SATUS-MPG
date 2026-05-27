import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/services/users/users.service';
import * as bcrypt from 'bcryptjs';
import { RolesService } from '../../roles/services/roles.service';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class AuthService {

    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly rolesService: RolesService,

    ) { }

    async validateUser(identifier: string, pass: string) {
        const user = await this.usersService.findByIdentifier(identifier);

        if (user) {
            const isMatch = await bcrypt.compare(pass, user.password);

            if (isMatch) {
                // FREE default
                const roleName = (user as any).roleName || 'FREE';

                console.log(`--- [SEGURIDAD] NODO VALIDADO: ${user.username} | RANGO: ${roleName} ---`);

                // Quita password y devuelve rol
                const { password, ...result } = user;
                return { ...result, roleName };
            }
        }

        throw new UnauthorizedException('Credenciales inválidas');
    }

    async login(user: any) {
        // Importante: El payload es lo que viaja DENTRO del JWT
        const payload = {
            username: user.username,
            sub: user._id,
            role: user.roleName
        };

        return {
            access_token: this.jwtService.sign(payload),
            role: user.roleName, // Va al localStorage del Front
            username: user.username
        };
    }

    //METODO Logueo Google

    // COMPUERTA CRIPTOGRÁFICA UNIVERSAL DE GOOGLE
    async validateGoogleToken(tokenPayload: string) {
        // 1. Inicializamos el cliente de validación de Google Identity
        const client = new OAuth2Client('://googleusercontent.com');

        try {
            // 2. Le ordenamos a Google verificar la firma digital del JWT enviado por Angular
            const ticket = await client.verifyIdToken({
                idToken: tokenPayload,
                audience: '://googleusercontent.com',
            });

            const payload = ticket.getPayload();
            if (!payload) throw new Error('JWT de Google vacío o corrupto.');

            // Extraemos los datos públicos autorizados por el analista
            const { email, name, picture } = payload;

            // 3. BUSQUEDA O GENERACIÓN AUTOMÁTICA EN MONGODB (Navaja de Ockham)
            // Buscamos si el correo ya tiene un nodo registrado en el búnker
            let user = await this.usersService.findByIdentifier(email);

            if (!user) {
                console.log(`✨ [NÚCLEO] Detectado nuevo usuario vía Google. Registrando nodo: ${email}`);

                const cleanUsername = name.replace(/\s+/g, '_').toLowerCase() + '_' + Math.random().toString(36).substring(2, 5);

                user = await this.usersService.create({
                    name: name,
                    lastName: 'Estándar',
                    docType: 'CC',
                    docNumber: 'GOOGLE_BYPASS_' + Math.random().toString(36).substring(2, 6).toUpperCase(),
                    email: email,
                    password: 'GOOGLE_HARDWARE_KEY_' + Math.random().toString(36).substring(2, 10),
                    isActive: true,
                    roleIds: ['660000000000000000000001']
                });

                (user as any).roleName = 'FREEDefault';
            } else {
                console.log(`🛰️ [NÚCLEO] Acceso concedido vía Google por Bypass para: ${(user as any).name || (user as any).username}`);
            }

            // EXTRACCIÓN DE CREDENCIALES (Bypass de tipado) 
            const finalRole = (user as any).roleName || 'FREEDefault';
            const finalUsername = (user as any).name || (user as any).username || 'INVITADO';

            // 4. TOKEN SATUS INTERNO
            const satusToken = this.jwtService.sign({
                _id: user._id || (user as any).id,
                username: finalUsername,
                role: finalRole
            });

            return {
                token: satusToken,
                role: finalRole,
                username: finalUsername
            };

            // ⚡ SOLUCIÓN CRÍTICA AL ERROR 'unknown': Tipamos explícitamente el catch como 'any' [google:1]
        } catch (error: any) {
            console.error('🚨 [ADUANA BACKEND] Verificación criptográfica de Google fallida:', error.message);
            throw new Error('Credenciales de Google no válidas.');
        }
    }


    async validateOrCreateGuestNode(guestId: string) {
        const technicalEmail = `${guestId.toLowerCase()}@satus.local`;

        // Busca el ID en DB 
        let guestUser = await this.usersService.findByIdentifier(technicalEmail);

        if (guestUser) {
            console.log(`📡 [ADUANA GUEST] Nodo existente detectado. Reutilizando expediente para: ${guestId}`);
        } else {
            // Si el ID no es coincidente al 100%, autoriza su creación en DB 
            console.log(`✨ [ADUANA GUEST] Creando canal persistente para: ${guestId}`);
            guestUser = await this.usersService.findOrCreateGuest(guestId);
        }

        const mappedUser = {
            username: (guestUser as any).username || guestId,
            _id: guestUser._id,
            roleName: (guestUser as any).roleName || 'FREEDefault' // Mantiene la consistencia de rango 
        };

        // Reutiliza el generador de tokens JWT 
        return this.login(mappedUser);
    }
}


