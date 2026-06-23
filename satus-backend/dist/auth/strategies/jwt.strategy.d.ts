import { Strategy } from 'passport-jwt';
import type { ConfigType } from '@nestjs/config';
import config from '../../config';
import { UsersService } from '../../users/services/users/users.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private userService;
    constructor(configService: ConfigType<typeof config>, userService: UsersService);
    validate(payload: JwtPayload): Promise<any>;
}
export {};
