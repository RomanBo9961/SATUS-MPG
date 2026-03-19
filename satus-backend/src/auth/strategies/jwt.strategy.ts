import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
// 🔹 IMPORTANTE: Importamos con 'type' para satisfacer el modo 'isolatedModules'
import type { ConfigType } from '@nestjs/config'; 
import config from '../../config'; 
import { UsersService } from '../../users/services/users/users.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(config.KEY) configService: ConfigType<typeof config>, 
    private userService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // 🔹 Usamos el "!" para asegurar que el secreto existe (ya validado por Joi)
      secretOrKey: configService.jwtSecret!, 
    });
  }

  // 🔹 Agregamos : Promise<any> explícito para matar el error TS7056
  async validate(payload: JwtPayload): Promise<any> {
    // En Mongo el payload.sub es un string (el ObjectId)
    const user = await this.userService.findOne(payload.sub.toString());
    
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Para evitar líos de tipos con Mongoose al desestructurar:
    const userObj = (user as any).toObject ? (user as any).toObject() : user;
    const { password, ...result } = userObj;
    
    return result;
  }
}
