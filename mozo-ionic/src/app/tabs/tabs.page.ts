import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SettingsService } from '../core/settings/settings.service';
import { KitchenApi } from '../core/api/kitchen-api';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  standalone: false,
})
export class TabsPage implements OnInit, OnDestroy {
  user: { legajo?: string; nombreCompleto?: string; rol?: string } | null = null;
  pendingCount = 0;
  private kitchenTimer?: any;

  constructor(private router: Router, private settings: SettingsService, private kitchenApi: KitchenApi) {
    this.loadUser();
  }

  ngOnInit() {
    this.startKitchenPolling();
  }

  ngOnDestroy() {
    if (this.kitchenTimer) clearInterval(this.kitchenTimer);
  }

  private loadUser() {
    try {
      const raw = localStorage.getItem('auth_user');
      this.user = raw ? JSON.parse(raw) : null;
    } catch {
      this.user = null;
    }
  }

  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    this.user = null;
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  get companyName() {
    return this.settings.getCompanyName();
  }

  get isAdmin() {
    const role = (this.user?.rol ?? (this.user as any)?.role ?? '').toString().toLowerCase();
    const roles: string[] = Array.isArray((this.user as any)?.roles)
      ? ((this.user as any).roles as any[]).map((r: any) => r?.toString?.().toLowerCase?.() ?? r)
      : [];
    const isAdminFlag = typeof (this.user as any)?.isAdmin === 'boolean' ? (this.user as any).isAdmin : undefined;

    return role === 'admin' || roles.includes('admin') || isAdminFlag === true;
  }

  get logoUrl() {
    return this.settings.getLogoUrl();
  }

  goAdmin() {
    this.router
      .navigate(['/admin'])
      .catch((err) => console.error('Navigation to /admin failed', err));
  }

  get isKitchen() {
    const role = (this.user?.rol ?? (this.user as any)?.role ?? '').toString().toLowerCase();
    const roles: string[] = Array.isArray((this.user as any)?.roles)
      ? ((this.user as any).roles as any[]).map((r: any) => r?.toString?.().toLowerCase?.() ?? r)
      : [];
    const isKitchenFlag = typeof (this.user as any)?.isKitchen === 'boolean' ? (this.user as any).isKitchen : undefined;

    return role === 'cocina' || role === 'kitchen' || roles.includes('cocina') || roles.includes('kitchen') || isKitchenFlag === true || this.isAdmin;
  }

  goCocina() {
    this.router
      .navigate(['/cocina'])
      .catch((err) => console.error('Navigation to /cocina failed', err));
  }

  private startKitchenPolling() {
    const tick = () => {
      if (!this.isKitchen) {
        this.pendingCount = 0;
        return;
      }
      this.kitchenApi.listarPendientes().subscribe({
        next: (pedidos) => {
          const count = (pedidos || []).reduce((acc, p: any) => acc + (p.items || []).filter((it: any) => it.estado === 'pendiente').length, 0);
          this.pendingCount = count;
        },
        error: () => {
          // mantener último valor en error
        }
      });
    };
    tick();
    this.kitchenTimer = setInterval(tick, 15000);
  }

}
