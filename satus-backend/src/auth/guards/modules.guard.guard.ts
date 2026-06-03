import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class ModulesGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    const requiredModules = this.reflector.get<string[]>('modules', context.getHandler()) ||
      this.reflector.get<string[]>('modules', context.getClass());
    if (!requiredModules || requiredModules.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    //console.log('🛑 [DEBUG SATUS] Objeto User en el Guard:', JSON.stringify(user, null, 2));

    if (user && (user.role === 'SUPAdmin' || user.roleName === 'SUPAdmin')) {
      console.log(`👑 [ModulesGuard] Acceso concedido: ${user.username}`);
      return true;
    }

    if (!user?.roles?.length) {
      throw new ForbiddenException('No roles assigned');
    }

    // Verificamos que al menos un rol tenga uno de los módulos requeridos
    const hasModule = user.roles.some(role =>
      role.modules?.some(m => requiredModules.includes(m.name))
    );

    if (!hasModule) {
      throw new ForbiddenException(`Missing required module: ${requiredModules}`);
    }

    return true;
  }
}