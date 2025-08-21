import { Component } from '@angular/core';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.scss'],
  standalone: false
})
export class InicioComponent {
  constructor(private auth: AuthService) {}

  get usuario$() {
    return this.auth.usuario$;
  }

  // Logo PNG empaquetado desde src/app/logos
  logoUrl: string = '/logos/logos.png';
}
