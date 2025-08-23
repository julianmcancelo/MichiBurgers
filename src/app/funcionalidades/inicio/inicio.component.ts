import { Component, OnDestroy } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { MapaSalonApiService } from '../mapa-meses/services/mapa-salon-api.service';
import {
  Subject,
  interval,
  combineLatest,
  startWith,
  switchMap,
  map,
  takeUntil,
  shareReplay,
} from 'rxjs';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.scss'],
  standalone: false,
})
export class InicioComponent implements OnDestroy {
  constructor(
    private auth: AuthService,
    private salonApi: MapaSalonApiService,
  ) {}

  get usuario$() {
    return this.auth.usuario$;
  }

  // Logo PNG empaquetado desde src/app/logos
  logoUrl: string = '/logos/logos.png';

  private destroy$ = new Subject<void>();

  // Poll estado de mesas (interior + exterior) y calcular contadores
  readonly mesasInterior$ = interval(10000).pipe(
    startWith(0),
    switchMap(() => this.salonApi.getEstadoMesas('interior')),
    takeUntil(this.destroy$),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  readonly mesasExterior$ = interval(10000).pipe(
    startWith(0),
    switchMap(() => this.salonApi.getEstadoMesas('exterior')),
    takeUntil(this.destroy$),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  readonly totales$ = combineLatest([this.mesasInterior$, this.mesasExterior$]).pipe(
    map(([i, e]) => {
      const all = [...(i || []), ...(e || [])];
      const ocupadas = all.filter((m) => m?.estado === 'ocupada').length;
      const libres = all.filter((m) => m?.estado === 'libre').length;
      const total = all.length;
      return { ocupadas, libres, total };
    }),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  readonly porArea$ = combineLatest([this.mesasInterior$, this.mesasExterior$]).pipe(
    map(([i, e]) => {
      const ni = i || [];
      const ne = e || [];
      const interior = {
        ocupadas: ni.filter((m) => m?.estado === 'ocupada').length,
        libres: ni.filter((m) => m?.estado === 'libre').length,
        total: ni.length,
      };
      const exterior = {
        ocupadas: ne.filter((m) => m?.estado === 'ocupada').length,
        libres: ne.filter((m) => m?.estado === 'libre').length,
        total: ne.length,
      };
      const total = interior.total + exterior.total;
      const ocupadas = interior.ocupadas + exterior.ocupadas;
      const ocupacion = total > 0 ? Math.round((ocupadas / total) * 100) : 0;
      return { interior, exterior, ocupacion };
    }),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
