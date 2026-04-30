import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {

    handleRequest(err, user, info, context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;

        
        if (authHeader === 'Bearer GUEST_TOKEN') {
            return {
                _id: '660000000000000000000000',
                username: 'INVITADO',
                roles: [{ name: 'GUEST', modules: [{ name: 'SCANNER' }] }]
            };
        }

        if (user && (!user.roles || typeof user.roles[0] === 'string')) {
            console.log('--- [GUARD] REPARANDO VÍNCULO DE ROL PARA:', user.username);

            // Si el ID del rol es el de PRO (...003), le inyectamos los permisos de PRO
            if (user.roles?.toString().includes('660000000000000000000003')) {
                user.roles = [{ name: 'PRO', modules: [{ name: 'SCANNER' }, { name: 'DASHBOARD' }] }];
            } else {
                // Por defecto, le damos permisos de FREE
                user.roles = [{ name: 'FREE', modules: [{ name: 'SCANNER' }] }];
            }
        }

        if (err || !user) {
            throw err || new UnauthorizedException('Nodo no autorizado');
        }
        return user;
    }
}
