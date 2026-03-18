import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt'; 
import { ConfigType } from '@nestjs/config';

import { AuthService } from '../auth/services/auth.service';
import { AuthController } from '../auth/controllers/auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import config from '../config';
import { ModulesGuard } from './guards/modules.guard.guard';
import { JwtAuthGuard } from './guards/auth.guard';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [config.KEY],
      useFactory: (configType: ConfigType<typeof config>): JwtModuleOptions => {
        return {
          secret: configType.jwtSecret!,
          signOptions: {
            expiresIn: configType.jwtExpiresIn!,
          },
        } as JwtModuleOptions;
      },
    }),
  ], // <--- Cierre de imports limpio
  providers: [AuthService, ModulesGuard, JwtAuthGuard, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService, ModulesGuard, JwtAuthGuard],
})
export class AuthModule {}
