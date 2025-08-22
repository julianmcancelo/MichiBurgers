import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    try {
      const raw = localStorage.getItem('auth_user');
      const user = raw ? JSON.parse(raw) : null;
      if (user?.rol === 'admin') return true;
    } catch {}
    this.router.navigateByUrl('/login');
    return false;
  }
}
