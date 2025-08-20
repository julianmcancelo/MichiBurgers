import { CanActivateFn, Router } from '@angular/router';
import { PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Rol, Usuario } from './models';

export const authGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // En SSR no hay localStorage. Evitamos redirigir en el servidor para que no parpadee el login.
  if (!isPlatformBrowser(platformId)) {
    return true;
  }
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  const rawUser = typeof window !== 'undefined' ? localStorage.getItem('auth_user') : null;
  const user: Usuario | null = rawUser ? (JSON.parse(rawUser) as Usuario) : null;

  if (!token || !user) {
    router.navigateByUrl('/auth/login');
    return false;
  }

  const rolesRequeridos = (route.data?.['roles'] as Rol[] | undefined) ?? undefined;
  if (rolesRequeridos && !rolesRequeridos.includes(user.rol)) {
    // rol no autorizado
    router.navigateByUrl('/');
    return false;
  }

  return true;
};
