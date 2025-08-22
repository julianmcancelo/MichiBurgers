import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonList, IonItem, IonInput, IonButton, IonAvatar, IonLabel } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../../core/settings/settings.service';

@Component({
  selector: 'app-admin-config',
  standalone: true,
  imports: [CommonModule, FormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
    IonList, IonItem, IonInput, IonButton, IonAvatar, IonLabel
  ],
  templateUrl: './admin-config.page.html',
  styleUrls: ['./admin-config.page.scss']
})
export class AdminConfigPage {
  companyName = '';
  logoUrl = '';

  constructor(private settings: SettingsService) {
    this.companyName = this.settings.getCompanyName();
    this.logoUrl = this.settings.getLogoUrl();
  }

  save() {
    this.settings.update({ companyName: this.companyName });
  }
}
