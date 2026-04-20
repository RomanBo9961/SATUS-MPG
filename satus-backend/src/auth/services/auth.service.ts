import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../users/entities/user.entity';
import { UsersService } from '../../users/services/users/users.service';
import * as bcrypt from 'bcrypt';
import { UserModel } from '../../users/interfaces/user';

@Injectable()
export class AuthService {

    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        // @InjectRepository(User) private userRepo: Repository<User>
    ) { }

async validateUser(identifier: string, pass: string) {
  //console.log('Identifier recibido:', identifier); 


const user = await this.usersService.findByIdentifier(identifier);
 console.log('Usuario encontrado en DB:', user ? user.username : 'NADIE');



if (user && await bcrypt.compare(pass, user.password)) {
    
    console.log('Contraseña coincidente: SÍ');

    const roleName = user.roles.length > 0 ? (user.roles[0] as any).name : 'FREE';
    
    const { password, ...result } = user.toObject();
    return { ...result, roleName };
}

console.log('Fallo: Usuario no existe o contraseña errónea');
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
