import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../users/entities/user.entity';
import { UsersService } from '../../users/services/users/users.service';
import * as bcrypt from 'bcryptjs';
import { UserModel } from '../../users/interfaces/user';

@Injectable()
export class AuthService {

    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        // @InjectRepository(User) private userRepo: Repository<User>
    ) { }

    async validateUser(identifier: string, pass: string) {
        const user = await this.usersService.findByIdentifier(identifier);

        if (user) {

            const isMatch = await bcrypt.compare(pass, user.password);
            //console.log('¿Resultado del cotejo?:', isMatch);

            if (isMatch) {
                // Convertimos el documento de Mongoose a un objeto plano de JS
                const userObj = user.toObject();

                console.log('--- [PROCESO_INTERNO] ---');
                console.log('¿Qué ID tiene el rol?:', userObj.roles?.[0]?._id);
                console.log('¿Qué NOMBRE tiene el rol?:', userObj.roles?.[0]?.name);

                let roleName = 'FREE';

                // Verificamos si existe el array y si el primer elemento tiene el campo 'name'
                if (userObj.roles && userObj.roles.length > 0) {
                    // Al estar poblado, roles[0] es el objeto { _id, name, ... }
                    roleName = userObj.roles[0].name || 'FREE';
                }

                console.log('--- [SISTEMA] ROL FINAL CONFIRMADO:', roleName);

                const { password, ...result } = userObj;
                return { ...result, roleName };
            }
        }

        //console.log('Fallo: Usuario no existe o contraseña errónea');
        throw new UnauthorizedException('Credenciales inválidas');
    }

    async login(user: any) {
        const payload = { username: user.username, sub: user._id, role: user.roleName };
        return {
            access_token: this.jwtService.sign(payload),
            role: user.roleName, // Envia el rol al front
            username: user.username
        };
    }

}
