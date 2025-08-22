import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { interval, Subject, switchMap, takeUntil, startWith } from 'rxjs';
import { MapaSalonApiService } from '../../services/mapa-salon-api.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

interface EstadoMesaItem {
  mesaId: string;
  estado: 'libre'|'ocupada';
  pedidoId?: number|null;
}

@Component({
  selector: 'app-estado-mesas',
  templateUrl: './estado-mesas.component.html',
  styleUrls: ['./estado-mesas.component.scss'],
  standalone: false
})
export class EstadoMesasComponent implements OnInit, OnDestroy {
  area: 'interior'|'exterior' = 'interior';
  filtro: 'todas'|'libres'|'ocupadas' = 'todas';
  listado: EstadoMesaItem[] = [];
  cargando = false;
  pedidoIdDialog: number | null = null;
  dialogRef: MatDialogRef<any> | null = null;

  @ViewChild('dlgPedido') dlgPedido!: TemplateRef<any>;

  private destroy$ = new Subject<void>();

  constructor(private api: MapaSalonApiService, private router: Router, private dialog: MatDialog) {}

  ngOnInit(): void {
    interval(5000)
      .pipe(
        startWith(0),
        takeUntil(this.destroy$),
        switchMap(() => this.api.getEstadoMesas(this.area))
      )
      .subscribe({
        next: (data) => {
          this.listado = data || [];
          this.cargando = false;
        },
        error: () => { this.cargando = false; }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cambiarArea(area: 'interior'|'exterior') {
    if (this.area !== area) {
      this.area = area;
      this.refrescarUnaVez();
    }
  }

  cambiarFiltro(f: 'todas'|'libres'|'ocupadas') { this.filtro = f; }

  get filtradas(): EstadoMesaItem[] {
    if (this.filtro === 'libres') return this.listado.filter(m => m.estado === 'libre');
    if (this.filtro === 'ocupadas') return this.listado.filter(m => m.estado === 'ocupada');
    return this.listado;
  }

  get totalLibres(): number { return this.listado.filter(m => m.estado === 'libre').length; }
  get totalOcupadas(): number { return this.listado.filter(m => m.estado === 'ocupada').length; }

  abrirOMirar(m: EstadoMesaItem) {
    if (m.estado === 'ocupada' && m.pedidoId) {
      this.router.navigate(['/comandera/pedido', m.pedidoId]);
    } else {
      // Atajo: navegar al mapa de salón con el área para que el mozo pueda abrirla ahí
      // (o podríamos crear un flujo directo si se requiere)
      this.router.navigate(['/mapa-meses/salon'], { queryParams: { area: this.area } });
    }
  }

  irAPedido(m: EstadoMesaItem) {
    if (m.pedidoId) {
      this.router.navigate(['/comandera/pedido', m.pedidoId]);
    }
  }

  facturar(m: EstadoMesaItem) {
    if (m.pedidoId) {
      this.router.navigate(['/comandera/pedido', m.pedidoId], { queryParams: { facturar: 1 } });
    }
  }

  verPedido(m: EstadoMesaItem) {
    if (!m.pedidoId) return;
    this.pedidoIdDialog = m.pedidoId;
    const ref = this.dialog.open(this.dlgPedido, {
      panelClass: ['dialog-elevada','dialog-movil'],
      autoFocus: false,
      restoreFocus: true,
      maxWidth: '1024px'
    });
    this.dialogRef = ref;
    ref.afterClosed().subscribe(() => {
      this.dialogRef = null;
      this.pedidoIdDialog = null;
      this.refrescarUnaVez();
    });
  }

  actualizarAhora() { this.refrescarUnaVez(); }

  tomarPedido(m: EstadoMesaItem) {
    if (m.estado !== 'libre') return;
    this.cargando = true;
    this.api.abrirMesa(this.area, m.mesaId).subscribe({
      next: (res) => {
        this.cargando = false;
        if (res?.ok && res?.pedidoId) {
          // Abrir modal con el pedido recién creado
          this.pedidoIdDialog = res.pedidoId;
          const ref = this.dialog.open(this.dlgPedido, {
            panelClass: ['dialog-elevada','dialog-movil'],
            autoFocus: false,
            restoreFocus: true,
            maxWidth: '1024px'
          });
          this.dialogRef = ref;
          ref.afterClosed().subscribe(() => {
            this.dialogRef = null;
            this.pedidoIdDialog = null;
            this.refrescarUnaVez();
          });
        } else {
          this.refrescarUnaVez();
        }
      },
      error: () => { this.cargando = false; this.refrescarUnaVez(); }
    });
  }

  liberarMesa(m: EstadoMesaItem) {
    if (m.estado !== 'ocupada') return;
    this.cargando = true;
    this.api.liberarMesa(this.area, m.mesaId).subscribe({
      next: () => { this.cargando = false; this.refrescarUnaVez(); },
      error: () => { this.cargando = false; this.refrescarUnaVez(); }
    });
  }

  private refrescarUnaVez() {
    this.cargando = true;
    this.api.getEstadoMesas(this.area).subscribe({
      next: (data) => { this.listado = data || []; this.cargando = false; },
      error: () => { this.cargando = false; }
    });
  }
}
