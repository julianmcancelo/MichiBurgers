import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../funcionalidades/auth/auth.service';

@Component({
  selector: 'app-layout-principal',
  templateUrl: './layout-principal.component.html',
  styleUrls: ['./layout-principal.component.scss'],
  standalone: false
})
export class LayoutPrincipalComponent {
  constructor(private auth: AuthService, private router: Router) {}

  get usuario$() {
    return this.auth.usuario$;
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/auth/login']);
  }
}
