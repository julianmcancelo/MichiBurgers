import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class KitchenGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    try {
      const raw = localStorage.getItem('auth_user');
      const user = raw ? JSON.parse(raw) : null;
      const role = (user?.rol ?? user?.role ?? '').toString().toLowerCase();
      const roles: string[] = Array.isArray(user?.roles)
        ? user.roles.map((r: any) => r?.toString?.().toLowerCase?.() ?? r)
        : [];
      const isKitchenFlag = typeof user?.isKitchen === 'boolean' ? user.isKitchen : undefined;

      const allowed =
        role === 'cocina' ||
        role === 'kitchen' ||
        roles.includes('cocina') ||
        roles.includes('kitchen') ||
        isKitchenFlag === true ||
        role === 'admin' ||
        roles.includes('admin');

      if (allowed) return true;
    } catch {}
    this.router.navigateByUrl('/login');
    return false;
  }
}
