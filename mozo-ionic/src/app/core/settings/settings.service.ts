import { Injectable } from '@angular/core';

export type AppSettings = {
  companyName: string;
  logoPath: string; // relative to /assets
};

const SETTINGS_KEY = 'app_settings';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private settings: AppSettings = {
    companyName: 'BURGERSAURIO',
    logoPath: 'logos/logo.png',
  };

  constructor() {
    this.load();
  }

  private load() {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) this.settings = { ...this.settings, ...JSON.parse(raw) };
    } catch {
      // ignore
    }
  }

  private persist() {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
  }

  getCompanyName() { return this.settings.companyName; }
  getLogoUrl() { return `/assets/${this.settings.logoPath}`; }

  update(values: Partial<AppSettings>) {
    this.settings = { ...this.settings, ...values };
    this.persist();
  }
}
