import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/services/users/users.service';
import * as bcrypt from 'bcryptjs';
import { RolesService } from '../../roles/services/roles.service';

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
}


