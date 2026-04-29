import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../users/entities/user.entity';
import { UsersService } from '../../users/services/users/users.service';
import * as bcrypt from 'bcryptjs';
import { UserModel } from '../../users/interfaces/user';
import { RolesService } from '../../roles/services/roles.service';

@Injectable()
export class AuthService {

    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly rolesService: RolesService,
        // @InjectRepository(User) private userRepo: Repository<User>
    ) { }

    async validateUser(identifier: string, pass: string) {
        const user = await this.usersService.findByIdentifier(identifier);

        if (user) {

            const isMatch = await bcrypt.compare(pass, user.password);
            //console.log('¿Resultado del cotejo?:', isMatch);

            if (isMatch) {

    const rawUser = await (this.usersService as any).userModel.collection.findOne({ _id: user._id });
    
    let roleName = 'FREE';
    
    if (rawUser && rawUser.roles && rawUser.roles.length > 0) {
        
        const idEnDisco = rawUser.roles.toString();
        
        
        if (idEnDisco === '660000000000000000000003') {
            roleName = 'PRO';
        } else {
            // populate sldps
            roleName = (user.roles && (user.roles as any).name) ? (user.roles as any).name : 'FREE';
        }
    }

    console.log(`--- [SEGURIDAD] NODO VALIDADO: ${user.username} | RANGO: ${roleName} ---`);

    const { password, ...result } = user;
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
            role: user.roleName, // Enviar el rol al front
            username: user.username
        };
    }

}
