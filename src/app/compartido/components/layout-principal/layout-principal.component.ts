import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';

import { AuthService } from '../../../funcionalidades/auth/auth.service';
import { ChangePasswordComponent } from '../../../funcionalidades/auth/components/change-password/change-password.component';

/**
 * LayoutPrincipalComponent
 *
 * Contenedor de layout principal (header/nav + outlet de rutas).
 * - Se sincroniza con `AuthService` para mostrar estado de sesión y rol actual.
 * - Evita parpadeos SSR utilizando `isPlatformBrowser` y semillas de estado tempranas.
 * - Controla menú mobile y navegación a login/logout.
 * - Abre el diálogo de cambio de contraseña.
 */

@Component({
  selector: 'app-layout-principal',
  templateUrl: './layout-principal.component.html',
  styleUrls: ['./layout-principal.component.scss'],
  standalone: false,
})
export class LayoutPrincipalComponent implements OnInit, OnDestroy {
  // Estado de autenticación y UI
  loggedIn = false; // Usuario autenticado
  nombreCompleto = ''; // Nombre para mostrar en header
  ready = false; // true en browser para evitar flash SSR
  private isBrowser = false; // Flag de plataforma
  hasToken = false; // Hay token almacenado
  esAdmin = false; // Conveniencia para toggles de UI
  esMozo = false; // Conveniencia para toggles de UI
  rolActual: 'admin' | 'mozo' | 'cocina' | 'caja' | '' = '';
  mobileMenuOpen = false; // Control del menú en móvil

  // Subscripciones a observables (para limpiar en OnDestroy)
  private sub?: Subscription;
  private subRouter?: Subscription;

  // Ruta actual es login (para ocultar elementos del layout)
  isLoginRoute = false;

  // Datos de UI
  currentYear: number = new Date().getFullYear();
  logoUrl = '/logos/logos.png'; // Logo empaquetado desde `src/app/logos`

  constructor(
    @Inject(PLATFORM_ID) platformId: object,
    private auth: AuthService,
    private router: Router,
    private dialog: MatDialog,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    // Semilla sincrónica: evita parpadeo del botón "Iniciar Sesión" al refrescar o hidratar
    try {
      if (this.isBrowser) {
        this.hasToken = !!this.auth.token;
        const raw = localStorage.getItem('auth_user');
        if (raw) {
          const u = JSON.parse(raw);
          this.loggedIn = true;
          this.nombreCompleto = u?.nombreCompleto || '';
          this.esAdmin = u?.rol === 'admin';
          this.esMozo = u?.rol === 'mozo';
          this.rolActual = (u?.rol as any) || '';
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
      this.esMozo = u0.rol === 'mozo';
      this.rolActual = (u0.rol as any) || '';
    } else if (this.isBrowser && this.auth.token) {
      // Si hay token pero no usuario en memoria, recuperar desde la API
      this.auth.me().subscribe({
        next: () => {
          this.hasToken = true;
        },
        error: () => {},
      });
    }

    // Mantenerse en sync con AuthService (stream de usuario)
    this.sub = this.auth.usuario$.subscribe((u: any) => {
      this.hasToken = this.isBrowser ? !!this.auth.token : false;
      if (u) {
        this.loggedIn = true;
        this.nombreCompleto = u.nombreCompleto || '';
        this.esAdmin = u.rol === 'admin';
        this.esMozo = u.rol === 'mozo';
        this.rolActual = (u.rol as any) || '';
      } else {
        this.loggedIn = false;
        this.nombreCompleto = '';
        this.esAdmin = false;
        this.esMozo = false;
        this.rolActual = '';
      }
    });

    // Determinar si estamos en la ruta de login y actualizar en cada navegación
    const updateLoginFlag = () => {
      const url = this.router.url || '';
      this.isLoginRoute = url.startsWith('/auth/login');
    };
    updateLoginFlag();
    this.subRouter = this.router.events.subscribe((ev) => {
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
    // Cierra sesión y redirige a login
    this.auth.logout();
    this.router.navigate(['/auth/login']);
  }

  toggleMobileMenu() {
    // Alterna visibilidad del menú en pantallas pequeñas
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  openChangePassword(): void {
    // Abre diálogo de cambio de contraseña en modo centrado y ancho fijo
    this.dialog.open(ChangePasswordComponent, {
      width: '520px',
      maxWidth: '95vw',
      autoFocus: false,
      restoreFocus: true,
      panelClass: 'dialog-elevada',
    });
  }
}
