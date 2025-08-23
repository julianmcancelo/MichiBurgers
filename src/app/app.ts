import { Component, signal } from '@angular/core';

import { SharedModule } from './compartido/compartido.module';

@Component({
  selector: 'app-root',
  imports: [SharedModule],
  template: `<app-layout-principal></app-layout-principal>`,
  styleUrl: '../styles.scss',
  standalone: true,
})
export class AppComponent {
  title = signal('burgersaurio');
}
