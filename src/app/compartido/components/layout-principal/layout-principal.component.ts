import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../../funcionalidades/auth/auth.service';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ChangePasswordComponent } from '../../../funcionalidades/auth/components/change-password/change-password.component';

@Component({
  selector: 'app-layout-principal',
  templateUrl: './layout-principal.component.html',
  styleUrls: ['./layout-principal.component.scss'],
  standalone: false
})
export class LayoutPrincipalComponent implements OnInit, OnDestroy {
  loggedIn = false;
  nombreCompleto = '';
  ready = false; // solo true en browser para evitar flash SSR
  private isBrowser = false;
  hasToken = false;
  esAdmin = false;
  mobileMenuOpen = false;
  private sub?: Subscription;
  private subRouter?: Subscription;
  isLoginRoute = false;
  currentYear: number = new Date().getFullYear();
  // Logo PNG empaquetado desde src/app/logos
  logoUrl: string = '/logos/logos.png';

  constructor(@Inject(PLATFORM_ID) platformId: Object, private auth: AuthService, private router: Router, private dialog: MatDialog) {
    this.isBrowser = isPlatformBrowser(platformId);
    // Semilla sincrónica para evitar parpadeo del botón "Iniciar Sesión" al refrescar
    try {
      if (this.isBrowser) {
        this.hasToken = !!this.auth.token;
        const raw = localStorage.getItem('auth_user');
        if (raw) {
          const u = JSON.parse(raw);
          this.loggedIn = true;
          this.nombreCompleto = u?.nombreCompleto || '';
          this.esAdmin = u?.rol === 'admin';
        }
      }
    } catch {}
  }

  ngOnInit(): void {
    // Semilla inmediata desde el servicio (evita depender del render SSR)
    const u0: any = this.auth.usuario;
    if (u0) {
      this.loggedIn = true;
      this.nombreCompleto = u0.nombreCompleto || '';
      this.hasToken = true;
      this.esAdmin = u0.rol === 'admin';
    } else if (this.isBrowser && this.auth.token) {
      // Si hay token pero no usuario en memoria, recuperar desde la API
      this.auth.me().subscribe({
        next: () => { this.hasToken = true; },
        error: () => {}
      });
    }

    // Mantenerse en sync con AuthService
    this.sub = this.auth.usuario$.subscribe((u: any) => {
      this.hasToken = this.isBrowser ? !!this.auth.token : false;
      if (u) {
        this.loggedIn = true;
        this.nombreCompleto = u.nombreCompleto || '';
        this.esAdmin = u.rol === 'admin';
      } else {
        this.loggedIn = false;
        this.nombreCompleto = '';
        this.esAdmin = false;
      }
    });

    // Determinar si estamos en la ruta de login y actualizar en cada navegación
    const updateLoginFlag = () => {
      const url = this.router.url || '';
      this.isLoginRoute = url.startsWith('/auth/login');
    };
    updateLoginFlag();
    this.subRouter = this.router.events.subscribe(ev => {
      if (ev instanceof NavigationEnd) {
        updateLoginFlag();
      }
    });

    // Indicar que ya estamos en cliente y listos para renderizar el área de usuario
    this.ready = this.isBrowser;
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.subRouter?.unsubscribe();
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/auth/login']);
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  openChangePassword(): void {
    this.dialog.open(ChangePasswordComponent, {
      width: '520px',
      maxWidth: '95vw',
      autoFocus: false,
      restoreFocus: true,
      panelClass: 'dialog-elevada'
    });
  }
}
