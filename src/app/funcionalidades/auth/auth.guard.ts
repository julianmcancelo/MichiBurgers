import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Rol, Usuario } from './models';

export const authGuard: CanActivateFn = (route) => {
  const router = inject(Router);
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
