import {
  Component,
  inject,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  signal,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MapaSalonApiService } from '../../../mapa-meses/services/mapa-salon-api.service';

@Component({
  selector: 'app-pedido',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
  ],
  template: `
    <div
      class="min-h-[100svh] bg-gradient-to-br from-orange-50 via-white to-orange-100 flex flex-col"
    >
      <!-- Top bar -->
      <div
        class="sticky top-0 z-40 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 text-white shadow"
      >
        <div class="px-4 py-3 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <button mat-icon-button (click)="volver()" class="text-white">
              <mat-icon>arrow_back</mat-icon>
            </button>
            <div class="hidden md:flex items-center gap-2 text-white/90 text-sm">
              <span>Órdenes</span>
              <mat-icon class="opacity-80">chevron_right</mat-icon>
              <span>Pedido #{{ pedido()?.pedido?.id || '-' }}</span>
            </div>
          </div>
          <div class="text-center">
            <div class="text-xs md:text-sm opacity-90">
              Pedido #{{ pedido()?.pedido?.id || '-' }}
            </div>
            <div class="font-semibold flex items-center gap-2">
              <span>Mesa {{ pedido()?.pedido?.mesa_id }}</span>
              <span
                class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide bg-white/20"
                >{{ pedido()?.pedido?.area }}</span
              >
            </div>
          </div>
          <div class="text-right text-sm">
            <div class="opacity-90">Total</div>
            <div class="font-extrabold tracking-tight">
              $ {{ pedido()?.pedido?.total | number: '1.2-2' }}
            </div>
            <div
              *ngIf="isPagado()"
              class="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200"
            >
              <mat-icon class="!text-base">verified</mat-icon>
              Pagado
            </div>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto px-3 py-3 md:px-6 md:py-6">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <!-- Items -->
          <div class="lg:col-span-2">
            <div
              class="bg-white/80 backdrop-blur-xl rounded-2xl shadow-md ring-1 ring-orange-100/60 overflow-hidden"
            >
              <div
                class="px-4 py-3 border-b text-gray-800 font-semibold flex items-center gap-2 bg-gradient-to-r from-white to-orange-50/50"
              >
                <mat-icon class="text-orange-600">list_alt</mat-icon>
                Ítems
              </div>
              <div class="p-2 divide-y divide-gray-100">
                <div
                  *ngFor="let it of pedido()?.items || []"
                  class="flex items-center justify-between gap-3 py-3 px-2 hover:bg-orange-50/60 transition-colors"
                >
                  <div class="min-w-0 flex items-start gap-3">
                    <div
                      class="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-100 to-orange-200 text-orange-700 flex items-center justify-center ring-1 ring-orange-200"
                    >
                      <mat-icon>lunch_dining</mat-icon>
                    </div>
                    <div class="min-w-0">
                      <div class="font-medium text-gray-900 truncate">{{ it.nombre }}</div>
                      <div class="text-xs text-gray-500">
                        $ {{ it.precio_unit | number: '1.2-2' }} c/u
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center gap-3">
                    <span
                      class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-700 text-sm font-bold ring-1 ring-orange-200 shadow"
                      >{{ it.cantidad }}</span
                    >
                    <div class="text-right">
                      <div class="text-xs text-gray-500">Subtotal</div>
                      <div class="font-semibold">$ {{ it.subtotal | number: '1.2-2' }}</div>
                    </div>
                  </div>
                </div>
                <div *ngIf="!(pedido()?.items || []).length" class="py-8 text-center text-gray-400">
                  Sin ítems aún
                </div>
              </div>
            </div>
          </div>

          <!-- Agregar producto -->
          <div>
            <div
              class="bg-white/80 backdrop-blur-xl rounded-2xl shadow-md ring-1 ring-orange-100/60 overflow-hidden"
            >
              <div
                class="px-4 py-3 border-b text-gray-800 font-semibold flex items-center gap-2 bg-gradient-to-r from-white to-orange-50/50"
              >
                <mat-icon class="text-orange-600">add_shopping_cart</mat-icon>
                Agregar producto
              </div>
              <div class="p-4 space-y-3 sm:space-y-4 pedido-form">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <mat-form-field appearance="fill" style="width:100%" class="sm:col-span-2">
                    <mat-label>Buscar</mat-label>
                    <mat-icon matPrefix class="text-orange-500">search</mat-icon>
                    <input
                      matInput
                      type="text"
                      [(ngModel)]="busqueda"
                      placeholder="Nombre del producto..."
                      aria-label="Buscar producto"
                      [disabled]="isPagado()"
                    />
                    <mat-hint>Podés escribir parte del nombre</mat-hint>
                  </mat-form-field>

                  <mat-form-field appearance="fill" style="width:100%">
                    <mat-label>Categoría</mat-label>
                    <mat-icon matPrefix class="text-orange-500">category</mat-icon>
                    <mat-select
                      [(ngModel)]="catSelId"
                      aria-label="Seleccionar categoría"
                      panelClass="pedido-select-panel"
                      [disabled]="isPagado()"
                    >
                      <mat-option [value]="'all'">Todas</mat-option>
                      <mat-option *ngFor="let c of categorias()" [value]="c.id">{{
                        c.nombre
                      }}</mat-option>
                    </mat-select>
                    <mat-hint>Filtra por tipo de producto</mat-hint>
                  </mat-form-field>

                  <mat-form-field appearance="fill" style="width:100%" class="sm:col-span-2">
                    <mat-label>Producto</mat-label>
                    <mat-icon matPrefix class="text-orange-500">restaurant_menu</mat-icon>
                    <mat-select
                      [(ngModel)]="productoSelId"
                      aria-label="Seleccionar producto"
                      panelClass="pedido-select-panel"
                      [disabled]="isPagado()"
                    >
                      <mat-option *ngFor="let p of productosFiltrados()" [value]="p.id">{{
                        p.nombre
                      }}</mat-option>
                    </mat-select>
                    <mat-hint>Elegí un producto de la lista</mat-hint>
                  </mat-form-field>

                  <mat-form-field appearance="fill" style="width:100%">
                    <mat-label>Cantidad</mat-label>
                    <mat-icon matPrefix class="text-orange-500">counter_1</mat-icon>
                    <input
                      matInput
                      type="number"
                      min="1"
                      [(ngModel)]="cantidad"
                      aria-label="Cantidad"
                      [disabled]="isPagado()"
                    />
                    <mat-hint>Valor mínimo 1</mat-hint>
                  </mat-form-field>
                </div>

                <button
                  mat-raised-button
                  color="primary"
                  class="w-full !h-12 !font-semibold shadow-md !rounded-xl"
                  (click)="agregar()"
                  [disabled]="!productoSelId || isPagado()"
                >
                  <mat-icon>add_circle</mat-icon>&nbsp;Agregar al pedido
                </button>
              </div>
            </div>

            <!-- Resumen -->
            <div
              class="mt-4 bg-white/80 backdrop-blur-xl rounded-2xl shadow-md ring-1 ring-orange-100/60 overflow-hidden"
            >
              <div
                class="px-4 py-3 border-b text-gray-800 font-semibold flex items-center gap-2 bg-gradient-to-r from-white to-orange-50/50"
              >
                <mat-icon class="text-orange-600">summarize</mat-icon>
                Resumen
              </div>
              <div class="p-4 space-y-3 text-sm">
                <div class="flex items-center justify-between">
                  <span class="text-gray-600">Ítems</span>
                  <span class="font-medium text-gray-900">{{
                    (pedido()?.items || []).length
                  }}</span>
                </div>
                <div class="flex items-center justify-between border-t pt-3">
                  <span class="text-gray-700">Total</span>
                  <span class="text-lg font-extrabold text-gray-900"
                    >$ {{ pedido()?.pedido?.total | number: '1.2-2' }}</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom actions -->
      <div
        class="sticky bottom-0 z-40 bg-white/90 backdrop-blur-xl border-t shadow-inner"
        *ngIf="!isPagado()"
      >
        <div class="px-3 py-3 grid grid-cols-3 gap-2 md:max-w-3xl md:mx-auto">
          <button
            mat-stroked-button
            color="accent"
            class="!h-12 !font-semibold"
            (click)="confirmarPago('efectivo')"
          >
            <mat-icon>attach_money</mat-icon>&nbsp;Efectivo
          </button>
          <button
            mat-stroked-button
            color="accent"
            class="!h-12 !font-semibold"
            (click)="confirmarPago('tarjeta')"
          >
            <mat-icon>credit_card</mat-icon>&nbsp;Tarjeta
          </button>
          <button
            mat-stroked-button
            color="accent"
            class="!h-12 !font-semibold"
            (click)="confirmarPago('qr')"
          >
            <mat-icon>qr_code</mat-icon>&nbsp;QR
          </button>
        </div>
      </div>

      <!-- Diálogo: Confirmar cobro -->
      <ng-template #dlgConfirmCobro>
        <div class="p-5 pt-4 max-w-[420px]">
          <div class="flex items-center gap-2 mb-2">
            <mat-icon class="text-orange-600">task_alt</mat-icon>
            <h3 class="text-lg font-semibold text-gray-900">Confirmar cobro</h3>
          </div>
          <p class="text-sm text-gray-600 mb-4">¿Se cobró correctamente?</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              mat-raised-button
              color="primary"
              (click)="dialogRef?.close(true)"
              class="!h-11 !rounded-xl"
            >
              <mat-icon>done</mat-icon>&nbsp;Sí, cobrado
            </button>
            <button
              mat-stroked-button
              color="warn"
              (click)="dialogRef?.close(false)"
              class="!h-11 !rounded-xl"
            >
              <mat-icon>close</mat-icon>&nbsp;No, cancelar
            </button>
          </div>
        </div>
      </ng-template>

      <!-- Diálogo: ¿Liberar mesa o seguir ocupada? -->
      <ng-template #dlgPostPago>
        <div class="p-5 pt-4 max-w-[420px]">
          <div class="flex items-center gap-2 mb-2">
            <mat-icon class="text-orange-600">fact_check</mat-icon>
            <h3 class="text-lg font-semibold text-gray-900">Pago registrado</h3>
          </div>
          <p class="text-sm text-gray-600 mb-4">
            ¿Cómo querés continuar con la mesa {{ pedido()?.pedido?.mesa_id }}?
          </p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              mat-raised-button
              color="primary"
              (click)="dialogRef?.close('liberar')"
              class="!h-11 !rounded-xl"
            >
              <mat-icon>check_circle</mat-icon>&nbsp;Terminar y liberar
            </button>
            <button
              mat-stroked-button
              color="primary"
              (click)="dialogRef?.close('seguir')"
              class="!h-11 !rounded-xl"
            >
              <mat-icon>event_seat</mat-icon>&nbsp;Seguir ocupada
            </button>
          </div>
        </div>
      </ng-template>

      <!-- Diálogo: Factura / Resumen -->
      <ng-template #dlgFactura>
        <div class="p-5 pt-4 max-w-[520px]">
          <div class="flex items-center gap-2 mb-3">
            <mat-icon class="text-orange-600">receipt_long</mat-icon>
            <h3 class="text-lg font-semibold text-gray-900">Factura / Resumen</h3>
          </div>
          <div class="text-sm text-gray-700 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-gray-600">Pedido</span>
              <span class="font-medium">#{{ pedido()?.pedido?.id }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-600">Mesa</span>
              <span class="font-medium"
                >{{ pedido()?.pedido?.mesa_id }} ({{ pedido()?.pedido?.area }})</span
              >
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-600">Ítems</span>
              <span class="font-medium">{{ (pedido()?.items || []).length }}</span>
            </div>
            <div class="flex items-center justify-between border-t pt-2">
              <span class="text-gray-800">Total a pagar</span>
              <span class="text-lg font-extrabold text-gray-900"
                >$ {{ pedido()?.pedido?.total | number: '1.2-2' }}</span
              >
            </div>
            <div class="mt-3 p-3 rounded-xl bg-orange-50 ring-1 ring-orange-200">
              <div class="text-xs text-orange-700 uppercase tracking-wide mb-1">Atendido por</div>
              <div class="flex items-center justify-between text-sm">
                <span class="font-medium text-gray-900">{{ mozoNombre }}</span>
                <span
                  class="text-[11px] px-2 py-0.5 rounded-full bg-orange-200/60 text-orange-900 uppercase tracking-wide"
                  >{{ mozoRol }}</span
                >
              </div>
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-4 gap-2 mt-4">
            <button
              mat-stroked-button
              color="primary"
              class="!h-11 !rounded-xl sm:col-span-1"
              (click)="dialogRef?.close()"
            >
              <mat-icon>close</mat-icon>&nbsp;Cerrar
            </button>
            <button
              mat-raised-button
              color="accent"
              class="!h-11 !rounded-xl sm:col-span-1"
              (click)="confirmarPagoDesdeFactura('efectivo')"
            >
              <mat-icon>attach_money</mat-icon>&nbsp;Efectivo
            </button>
            <button
              mat-raised-button
              color="accent"
              class="!h-11 !rounded-xl sm:col-span-1"
              (click)="confirmarPagoDesdeFactura('tarjeta')"
            >
              <mat-icon>credit_card</mat-icon>&nbsp;Tarjeta
            </button>
            <button
              mat-raised-button
              color="accent"
              class="!h-11 !rounded-xl sm:col-span-1"
              (click)="confirmarPagoDesdeFactura('qr')"
            >
              <mat-icon>qr_code</mat-icon>&nbsp;QR
            </button>
          </div>
        </div>
      </ng-template>
    </div>
  `,
  styles: [
    `
      /* Mantener soporte desktop simple si no hay Tailwind */
      @media (min-width: 1024px) {
        :host {
          display: block;
        }
      }
    `,
  ],
})
export class PedidoComponent implements OnInit, OnChanges {
  @ViewChild('dlgConfirmCobro') dlgConfirmCobro!: TemplateRef<any>;
  @ViewChild('dlgPostPago') dlgPostPago!: TemplateRef<any>;
  @ViewChild('dlgFactura') dlgFactura!: TemplateRef<any>;
  private route = inject(ActivatedRoute);
  private api = inject(MapaSalonApiService);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  dialogRef: MatDialogRef<any> | null = null;

  pedido = signal<{ pedido: any; items: any[] } | null>(null);
  categorias = signal<any[]>([]);
  productos = signal<any[]>([]);

  @Input() pedidoIdInput?: number;

  mozoNombre = '';
  mozoRol = '';
  private facturaMostrada = false;

  productoSelId: number | null = null;
  cantidad = 1;
  busqueda = '';
  catSelId: number | 'all' = 'all';

  ngOnInit(): void {
    // Cargar por ruta si existe
    const idRuta = Number(this.route.snapshot.paramMap.get('id')) || 0;
    if (idRuta > 0) this.cargar(idRuta);
    // Cargar por input si viene embebido
    if (!idRuta && this.pedidoIdInput && this.pedidoIdInput > 0) {
      this.cargar(this.pedidoIdInput);
    }
    // Cargar datos de usuario (mozo)
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('auth_user') : null;
      if (raw) {
        const u = JSON.parse(raw);
        this.mozoNombre = u?.nombreCompleto || '';
        this.mozoRol = (u?.rol || '').toUpperCase();
      }
    } catch {}
    this.api.listarProductos().subscribe({
      next: (res) => {
        this.categorias.set(res.categorias || []);
        this.productos.set(res.productos || []);
      },
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['pedidoIdInput'] && this.pedidoIdInput && this.pedidoIdInput > 0) {
      this.cargar(this.pedidoIdInput);
    }
  }

  productosPorCat(catId: number) {
    return (this.productos() || []).filter((p) => p.categoria_id === catId);
  }

  productosFiltrados() {
    const txt = (this.busqueda || '').toLowerCase();
    return (this.productos() || [])
      .filter((p) => (this.catSelId === 'all' ? true : p.categoria_id === this.catSelId))
      .filter((p) => !txt || (p.nombre || '').toLowerCase().includes(txt));
  }

  cargar(id: number) {
    this.api.pedidoDetalle(id).subscribe({
      next: (res) => {
        this.pedido.set(res);
        this.abrirFacturaSiParam();
      },
    });
  }

  agregar() {
    const ped = this.pedido();
    if (!ped || !this.productoSelId || this.isPagado()) return;
    this.api.agregarItem(ped.pedido.id, this.productoSelId, this.cantidad || 1).subscribe({
      next: () => this.cargar(ped.pedido.id),
    });
  }

  confirmarPago(metodo: 'efectivo' | 'tarjeta' | 'qr' | 'mixto') {
    // Si viene desde otro diálogo (ej. factura), cerrarlo primero
    this.dialogRef?.close();
    const ped = this.pedido();
    if (!ped) return;
    // 1) Confirmar cobro
    const refConfirm = this.dialog.open<boolean>(this.dlgConfirmCobro, {
      panelClass: 'dialog-elevada',
      autoFocus: false,
      restoreFocus: true,
      disableClose: false,
    });
    this.dialogRef = refConfirm;
    refConfirm.afterClosed().subscribe((cobrado) => {
      this.dialogRef = null;
      if (cobrado !== true) return; // cancelado por el mozo
      // 2) Registrar el pago (solo marca pagado, no libera mesa)
      this.api.pagarPedido(ped.pedido.id, metodo).subscribe({
        next: () => {
          // 3) Refrescar el pedido para reflejar estado 'pagado'
          this.cargar(ped.pedido.id);
        },
      });
    });
  }

  private abrirFacturaSiParam() {
    if (this.facturaMostrada) return;
    const f = this.route.snapshot.queryParamMap.get('facturar');
    if (f === '1') {
      const ref = this.dialog.open(this.dlgFactura, {
        panelClass: 'dialog-elevada',
        autoFocus: false,
        restoreFocus: true,
      });
      this.dialogRef = ref;
      this.facturaMostrada = true;
    }
  }

  confirmarPagoDesdeFactura(metodo: 'efectivo' | 'tarjeta' | 'qr') {
    this.confirmarPago(metodo);
  }

  isPagado(): boolean {
    return (this.pedido()?.pedido?.estado || '') === 'pagado';
  }

  volver() {
    this.router.navigate(['/comandera/pedidos']);
  }
}
