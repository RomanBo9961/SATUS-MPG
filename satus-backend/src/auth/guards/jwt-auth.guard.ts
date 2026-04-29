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
                roles: [{
                    name: 'GUEST',
                    modules: [{ name: 'SCANNER' }] 
                }]
            };
        }

        // Lógica normal para tokens JWT reales
        if (err || !user) {
            throw err || new UnauthorizedException('Nodo no autorizado');
        }
        return user;
    }
}
