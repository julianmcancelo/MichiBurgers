import { Component, signal } from '@angular/core';
import { CompartidoModule } from './compartido/compartido.module';

@Component({
  selector: 'app-root',
  imports: [CompartidoModule],
  template: `<app-layout-principal></app-layout-principal>`,
  styleUrl: './app.scss',
  standalone: true
})
export class AppComponent {
  title = signal('burgersaurio');
}
