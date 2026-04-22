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
        console.log('Contraseña coincidente: SÍ');
        const roleName = user.roles && user.roles.length > 0 ? (user.roles[0] as any).name : 'FREE';
        const { password, ...result } = user.toObject();
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
