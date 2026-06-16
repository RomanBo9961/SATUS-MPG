import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);

    // Extrae los datos de la sesión guardados por tu login
    const token = localStorage.getItem('satusToken');
    const userRole = localStorage.getItem('user_role');

    // Sin token, fijo a la Landing
    if (!token) {
        console.warn('🚨 [GUARDIÁN FRONT]: Intento de acceso sin credenciales. Expulsando a la landing...');
        router.navigate(['/landing']);
        return false;
    }

    const targetPath = route.routeConfig?.path;

    if (targetPath === 'admin-control') {
        // Si se intenta forzar la entrada al ctr de SuperAdmin
        if (userRole !== 'SUPAdmin') {
            console.error(`🚨 [GUARDIÁN FRONT]: Acceso denegado para el rol [${userRole}] en la ruta [/admin-control].`);
            router.navigate(['/dashboard']);
            return false;
        }
    }

    return true;
};
