import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SettingsService } from '../core/settings/settings.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  standalone: false,
})
export class TabsPage {
  user: { legajo?: string; nombreCompleto?: string; rol?: string } | null = null;

  constructor(private router: Router, private settings: SettingsService) {
    this.loadUser();
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
    return this.user?.rol === 'admin';
  }

  get logoUrl() {
    return this.settings.getLogoUrl();
  }

}
