import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { interval, Subject, switchMap, takeUntil, startWith } from 'rxjs';

import { MapaSalonApiService } from '../../services/mapa-salon-api.service';

interface EstadoMesaItem {
  mesaId: string;
  estado: 'libre' | 'ocupada';
  pedidoId?: number | null;
  pedidoEstado?: 'abierto' | 'pagado' | 'cerrado' | string;
  pagado?: boolean;
}

@Component({
  selector: 'app-estado-mesas',
  templateUrl: './estado-mesas.component.html',
  styleUrls: ['./estado-mesas.component.scss'],
  standalone: false,
})
export class EstadoMesasComponent implements OnInit, OnDestroy {
  area: 'interior' | 'exterior' = 'interior';
  filtro: 'todas' | 'libres' | 'ocupadas' = 'todas';
  listado: EstadoMesaItem[] = [];
  cargando = false;
  pedidoIdDialog: number | null = null;
  dialogRef: MatDialogRef<any> | null = null;

  // Layout del salón (solo lectura)
  ancho = 1200;
  alto = 800;
  private padding = 40; // padding para viewBox
  layoutMesas: {
    id: string;
    nombre?: string;
    x: number;
    y: number;
    forma: 'redonda' | 'cuadrada' | 'rectangular' | 'dinosaurio';
    ancho?: number;
    alto?: number;
    area?: 'interior' | 'exterior';
  }[] = [];

  // Zoom/Pan
  scale = 1;
  tx = 0;
  ty = 0;
  isDisplay = false; // modo ventana exclusiva sin UI, solo mapa
  private isPanning = false;
  private panStart: { x: number; y: number; tx: number; ty: number } | null = null;
  private pinchStart: { d: number; scale: number; cx: number; cy: number } | null = null;

  // Context menu (desktop)
  ctxVisible = false;
  ctxX = 0;
  ctxY = 0;
  ctxMesaId: string | null = null;
  ctxItem: EstadoMesaItem | null = null;
  ctxPuedeLiberar = false;
  ctxPuedeFacturar = false;
  ctxLabelAbrirVer = 'Abrir/Ver';

  @ViewChild('dlgPedido') dlgPedido!: TemplateRef<any>;
  @ViewChild('tplMapaFull') tplMapaFull!: TemplateRef<any>;

  private destroy$ = new Subject<void>();

  constructor(
    private api: MapaSalonApiService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    // Cargar layout inicial
    this.cargarLayout();
    // Modo display exclusivo en ventana aparte
    const display = this.route.snapshot.queryParamMap.get('display');
    this.isDisplay = display === '1';
    if (this.isDisplay) {
      setTimeout(() => {
        try {
          document?.documentElement?.requestFullscreen?.();
        } catch {}
      }, 0);
    }

    interval(5000)
      .pipe(
        startWith(0),
        takeUntil(this.destroy$),
        switchMap(() => this.api.getEstadoMesas(this.area)),
      )
      .subscribe({
        next: (data) => {
          this.listado = data || [];
          this.cargando = false;
        },
        error: () => {
          this.cargando = false;
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cambiarArea(area: 'interior' | 'exterior') {
    if (this.area !== area) {
      this.area = area;
      this.cargarLayout();
      this.refrescarUnaVez();
    }
  }

  cambiarFiltro(f: 'todas' | 'libres' | 'ocupadas') {
    this.filtro = f;
  }

  get filtradas(): EstadoMesaItem[] {
    if (this.filtro === 'libres') return this.listado.filter((m) => m.estado === 'libre');
    if (this.filtro === 'ocupadas') return this.listado.filter((m) => m.estado === 'ocupada');
    return this.listado;
  }

  get totalLibres(): number {
    return this.listado.filter((m) => m.estado === 'libre').length;
  }
  get totalOcupadas(): number {
    return this.listado.filter((m) => m.estado === 'ocupada').length;
  }

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
      panelClass: ['dialog-elevada', 'dialog-movil'],
      autoFocus: false,
      restoreFocus: true,
      maxWidth: '1024px',
    });
    this.dialogRef = ref;
    ref.afterClosed().subscribe(() => {
      this.dialogRef = null;
      this.pedidoIdDialog = null;
      this.refrescarUnaVez();
    });
  }

  actualizarAhora() {
    this.refrescarUnaVez();
  }

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
            panelClass: ['dialog-elevada', 'dialog-movil'],
            autoFocus: false,
            restoreFocus: true,
            maxWidth: '1024px',
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
      error: () => {
        this.cargando = false;
        this.refrescarUnaVez();
      },
    });
  }

  liberarMesa(m: EstadoMesaItem) {
    if (m.estado !== 'ocupada') return;
    this.cargando = true;
    this.api.liberarMesa(this.area, m.mesaId).subscribe({
      next: () => {
        this.cargando = false;
        this.refrescarUnaVez();
      },
      error: () => {
        this.cargando = false;
        this.refrescarUnaVez();
      },
    });
  }

  private refrescarUnaVez() {
    this.cargando = true;
    this.api.getEstadoMesas(this.area).subscribe({
      next: (data) => {
        this.listado = data || [];
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
      },
    });
  }

  private cargarLayout() {
    this.api.getLayout(this.area).subscribe({
      next: (mesas) => {
        if (Array.isArray(mesas)) {
          this.layoutMesas = mesas
            .map((m: any) => {
              const forma = (m.forma as any) || 'cuadrada';
              const ancho = Number.isFinite(Number(m.ancho))
                ? Number(m.ancho)
                : forma === 'redonda'
                  ? 100
                  : 120;
              const alto = Number.isFinite(Number(m.alto))
                ? Number(m.alto)
                : forma === 'redonda'
                  ? Number(m.ancho) || 100
                  : 90;
              return {
                id: String((m as any).id),
                nombre: m.nombre,
                x: Number(m.x) || 0,
                y: Number(m.y) || 0,
                forma,
                ancho,
                alto,
                area: ((m as any).area as any) || this.area,
              };
            })
            .filter((mm) => (mm.area || 'interior') === this.area);
          this.ajustarDimensiones();
        }
      },
      error: () => {},
    });
  }

  estadoDeMesa(id: string): {
    estado: 'libre' | 'ocupada';
    pagado?: boolean;
    pedidoEstado?: string;
  } {
    const m = this.listado.find((x) => x.mesaId === id);
    if (!m) return { estado: 'libre' };
    return { estado: m.estado, pagado: m.pagado, pedidoEstado: m.pedidoEstado } as any;
  }

  colorMesa(id: string): string {
    const e = this.estadoDeMesa(id);
    if (e.estado === 'libre') return '#dcfce7'; // verde claro
    if (e.pedidoEstado === 'cerrado') return '#e5e7eb'; // gris
    if (e.pagado) return '#d1fae5'; // verde/emerald
    return '#fee2e2'; // rojo claro
  }

  private ajustarDimensiones() {
    if (!this.layoutMesas?.length) {
      this.ancho = 1200;
      this.alto = 800;
      return;
    }
    let maxX = 0,
      maxY = 0;
    for (const m of this.layoutMesas) {
      const w = m.ancho || (m.forma === 'redonda' ? 100 : 120);
      const h = m.alto || (m.forma === 'redonda' ? m.ancho || 100 : 90);
      maxX = Math.max(maxX, m.x + w);
      maxY = Math.max(maxY, m.y + h);
    }
    this.ancho = Math.max(400, maxX + this.padding);
    this.alto = Math.max(300, maxY + this.padding);
  }

  // ===== Zoom/Pan Handlers =====
  onWheelZoom(ev: WheelEvent) {
    ev.preventDefault();
    const delta = -Math.sign(ev.deltaY) * 0.1; // zoom in con wheel arriba
    const newScale = Math.min(4, Math.max(0.4, this.scale + delta));
    const rect = (ev.target as SVGElement).getBoundingClientRect();
    const mx = ev.clientX - rect.left;
    const my = ev.clientY - rect.top;
    this.zoomAtPoint(mx, my, newScale);
  }

  private zoomAtPoint(mx: number, my: number, newScale: number) {
    const prev = this.scale;
    if (newScale === prev) return;
    // ajustar translate para que el punto bajo el cursor permanezca estable
    this.tx = mx - (mx - this.tx) * (newScale / prev);
    this.ty = my - (my - this.ty) * (newScale / prev);
    this.scale = newScale;
  }

  onPointerDown(ev: PointerEvent) {
    (ev.target as Element).setPointerCapture?.(ev.pointerId);
    if ((ev as any).touches && (ev as any).touches.length === 2) {
      // pinch start
      const t0 = (ev as any).touches[0];
      const t1 = (ev as any).touches[1];
      const d = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
      const cx = (t0.clientX + t1.clientX) / 2;
      const cy = (t0.clientY + t1.clientY) / 2;
      this.pinchStart = { d, scale: this.scale, cx, cy };
      this.isPanning = false;
      this.panStart = null;
      return;
    }
    // pan start
    this.isPanning = true;
    this.panStart = { x: ev.clientX, y: ev.clientY, tx: this.tx, ty: this.ty };
  }

  onPointerMove(ev: PointerEvent) {
    if (this.pinchStart && (ev as any).touches && (ev as any).touches.length === 2) {
      const t0 = (ev as any).touches[0];
      const t1 = (ev as any).touches[1];
      const d = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
      const cx = (t0.clientX + t1.clientX) / 2;
      const cy = (t0.clientY + t1.clientY) / 2;
      const ratio = d / this.pinchStart.d;
      const newScale = Math.min(4, Math.max(0.4, this.pinchStart.scale * ratio));
      this.zoomAtPoint(cx, cy, newScale);
      return;
    }
    if (this.isPanning && this.panStart) {
      const dx = ev.clientX - this.panStart.x;
      const dy = ev.clientY - this.panStart.y;
      this.tx = this.panStart.tx + dx;
      this.ty = this.panStart.ty + dy;
    }
  }

  onPointerUp() {
    this.isPanning = false;
    this.panStart = null;
    this.pinchStart = null;
  }

  resetView() {
    this.scale = 1;
    this.tx = 0;
    this.ty = 0;
  }

  abrirMapaFull() {
    const ref = this.dialog.open(this.tplMapaFull, {
      panelClass: ['dialog-elevada', 'dialog-movil'],
      autoFocus: false,
      restoreFocus: true,
      maxWidth: '95vw',
      width: '95vw',
    });
    this.dialogRef = ref;
    ref.afterClosed().subscribe(() => {
      this.dialogRef = null;
    });
  }

  abrirVentanaExclusiva() {
    const tree = this.router.createUrlTree(['./'], {
      relativeTo: this.route,
      queryParams: {
        ...Object.fromEntries(
          this.route.snapshot.queryParamMap.keys.map(
            (k) => [k, this.route.snapshot.queryParamMap.get(k)] as [string, any],
          ),
        ),
        display: 1,
        area: this.area,
      },
      queryParamsHandling: 'merge',
    });
    const url = this.router.serializeUrl(tree);
    const abs = (window?.location?.origin || '') + url;
    window.open(abs, '_blank', 'noopener,noreferrer');
  }

  cerrarVentana() {
    try {
      window.close();
    } catch {
      /* noop */
    }
  }

  private estadoItemPorId(id: string): EstadoMesaItem | undefined {
    return this.listado.find((x) => x.mesaId === id);
  }

  // ===== Interacciones táctiles/ratón =====
  private pressTimer: any = null;
  private pressFired = false;
  private pressId: string | null = null;
  private lastTapTs = 0;
  private lastTapId: string | null = null;

  onMesaTap(id: string) {
    // doble-tap para facturar si está ocupada
    const now = Date.now();
    if (this.lastTapId === id && now - this.lastTapTs < 300) {
      const it = this.estadoItemPorId(id);
      if (it && it.estado === 'ocupada' && it.pedidoId) {
        this.facturar({ mesaId: id, estado: 'ocupada', pedidoId: it.pedidoId });
        this.lastTapId = null;
        this.lastTapTs = 0;
        return;
      }
    }
    this.lastTapId = id;
    this.lastTapTs = now;

    const item = this.estadoItemPorId(id);
    if (!item) {
      // No hay estado registrado: tratar como libre
      this.tomarPedido({ mesaId: id, estado: 'libre', pedidoId: null });
      return;
    }
    if (item.estado === 'libre') {
      this.tomarPedido({ mesaId: id, estado: 'libre', pedidoId: null });
      return;
    }
    // ocupada: si tiene pedidoId, abrir modal de pedido
    if (item.pedidoId) {
      this.verPedido({ mesaId: id, estado: 'ocupada', pedidoId: item.pedidoId });
    }
  }

  onMesaPressStart(id: string, ev: Event) {
    // prevenir scroll en mobile cuando es long-press
    try {
      ev.preventDefault();
    } catch {}
    this.clearPress();
    this.pressId = id;
    this.pressFired = false;
    this.pressTimer = setTimeout(() => {
      this.pressFired = true;
      const it = this.estadoItemPorId(id);
      if (it && it.estado === 'ocupada') {
        // long-press: liberar mesa
        if ('vibrate' in navigator) {
          try {
            (navigator as any).vibrate?.(10);
          } catch {}
        }
        this.liberarMesa({ mesaId: id, estado: 'ocupada', pedidoId: it.pedidoId ?? null });
      }
    }, 550);
  }

  onMesaPressEnd(ev?: Event) {
    if (this.pressTimer) {
      clearTimeout(this.pressTimer);
      this.pressTimer = null;
    }
    // si se disparó long-press, anulamos el click/tap inmediato
    if (this.pressFired) {
      try {
        ev?.stopPropagation?.();
      } catch {}
    }
    this.pressFired = false;
    this.pressId = null;
  }

  private clearPress() {
    if (this.pressTimer) {
      clearTimeout(this.pressTimer);
      this.pressTimer = null;
    }
    this.pressFired = false;
    this.pressId = null;
  }

  // ====== Context menu (desktop) ======
  onMesaContextMenu(ev: MouseEvent, id: string) {
    ev.preventDefault();
    this.ctxMesaId = id;
    this.ctxX = ev.clientX;
    this.ctxY = ev.clientY;
    const it = this.estadoItemPorId(id);
    this.ctxItem = it ?? { mesaId: id, estado: 'libre', pedidoId: null };
    this.ctxPuedeLiberar = !!(this.ctxItem && this.ctxItem.estado === 'ocupada');
    this.ctxPuedeFacturar = !!(this.ctxItem && !!this.ctxItem.pedidoId);
    this.ctxLabelAbrirVer = !it || it.estado === 'libre' ? 'Abrir pedido' : 'Ver pedido';
    this.ctxVisible = true;
  }

  closeContextMenu() {
    this.ctxVisible = false;
    this.ctxMesaId = null;
    this.ctxItem = null;
  }

  ctxAbrirVer() {
    if (!this.ctxMesaId) return;
    const it = this.estadoItemPorId(this.ctxMesaId);
    if (!it || it.estado === 'libre')
      this.tomarPedido({ mesaId: this.ctxMesaId, estado: 'libre', pedidoId: null });
    else if (it.pedidoId)
      this.verPedido({ mesaId: this.ctxMesaId, estado: 'ocupada', pedidoId: it.pedidoId });
    this.closeContextMenu();
  }

  ctxLiberar() {
    if (!this.ctxMesaId) return;
    const it = this.estadoItemPorId(this.ctxMesaId);
    if (it && it.estado === 'ocupada')
      this.liberarMesa({
        mesaId: this.ctxMesaId,
        estado: 'ocupada',
        pedidoId: it.pedidoId ?? null,
      });
    this.closeContextMenu();
  }

  ctxFacturar() {
    if (!this.ctxMesaId) return;
    const it = this.estadoItemPorId(this.ctxMesaId);
    if (it && it.pedidoId)
      this.facturar({ mesaId: this.ctxMesaId, estado: 'ocupada', pedidoId: it.pedidoId });
    this.closeContextMenu();
  }
}
