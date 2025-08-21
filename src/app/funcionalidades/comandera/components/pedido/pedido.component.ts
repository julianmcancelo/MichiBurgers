import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MapaSalonApiService } from '../../../mapa-meses/services/mapa-salon-api.service';

@Component({
  selector: 'app-pedido',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatCardModule, MatButtonModule, MatIconModule, MatListModule,
    MatSelectModule, MatFormFieldModule, MatInputModule,
  ],
  template: `
  <div class="min-h-[100svh] bg-gradient-to-br from-orange-50 via-white to-orange-100 flex flex-col">
    <!-- Top bar -->
    <div class="sticky top-0 z-40 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 text-white shadow">
      <div class="px-4 py-3 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <button mat-icon-button (click)="volver()" class="text-white"><mat-icon>arrow_back</mat-icon></button>
          <div class="hidden md:flex items-center gap-2 text-white/90 text-sm">
            <span>Órdenes</span>
            <mat-icon class="opacity-80">chevron_right</mat-icon>
            <span>Pedido #{{ pedido()?.pedido?.id || '-' }}</span>
          </div>
        </div>
        <div class="text-center">
          <div class="text-xs md:text-sm opacity-90">Pedido #{{ pedido()?.pedido?.id || '-' }}</div>
          <div class="font-semibold flex items-center gap-2">
            <span>Mesa {{ pedido()?.pedido?.mesa_id }}</span>
            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide bg-white/20">{{ pedido()?.pedido?.area }}</span>
          </div>
        </div>
        <div class="text-right text-sm">
          <div class="opacity-90">Total</div>
          <div class="font-extrabold tracking-tight">$ {{ pedido()?.pedido?.total | number:'1.2-2' }}</div>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto px-3 py-3 md:px-6 md:py-6">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <!-- Items -->
        <div class="lg:col-span-2">
          <div class="bg-white/90 backdrop-blur-xl rounded-2xl shadow border border-white/60 overflow-hidden">
            <div class="px-4 py-3 border-b text-gray-800 font-semibold flex items-center gap-2">
              <mat-icon class="text-orange-600">list_alt</mat-icon>
              Ítems
            </div>
            <div class="p-2">
              <div *ngFor="let it of (pedido()?.items || [])" class="flex items-center justify-between gap-3 py-3 px-2 rounded-lg hover:bg-orange-50 transition-colors">
                <div class="min-w-0 flex items-start gap-3">
                  <div class="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center">
                    <mat-icon>lunch_dining</mat-icon>
                  </div>
                  <div class="min-w-0">
                    <div class="font-medium text-gray-900 truncate">{{ it.nombre }}</div>
                    <div class="text-xs text-gray-500">$ {{ it.precio_unit | number:'1.2-2' }} c/u</div>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-700 text-sm font-bold">{{ it.cantidad }}</span>
                  <div class="text-right">
                    <div class="text-xs text-gray-500">Subtotal</div>
                    <div class="font-semibold">$ {{ it.subtotal | number:'1.2-2' }}</div>
                  </div>
                </div>
              </div>
              <div *ngIf="!(pedido()?.items || []).length" class="py-8 text-center text-gray-400">Sin ítems aún</div>
            </div>
          </div>
        </div>

        <!-- Agregar producto -->
        <div>
          <div class="bg-white/90 backdrop-blur-xl rounded-2xl shadow border border-white/60 overflow-hidden">
            <div class="px-4 py-3 border-b text-gray-800 font-semibold flex items-center gap-2">
              <mat-icon class="text-orange-600">add_shopping_cart</mat-icon>
              Agregar producto
            </div>
            <div class="p-4 space-y-3">
              <mat-form-field appearance="outline" style="width:100%">
                <mat-label>Buscar</mat-label>
                <mat-icon matPrefix class="text-orange-500">search</mat-icon>
                <input matInput type="text" [(ngModel)]="busqueda" placeholder="Nombre del producto..." aria-label="Buscar producto" />
                <mat-hint>Podés escribir parte del nombre</mat-hint>
              </mat-form-field>

              <mat-form-field appearance="outline" style="width:100%">
                <mat-label>Categoría</mat-label>
                <mat-icon matPrefix class="text-orange-500">category</mat-icon>
                <mat-select [(ngModel)]="catSelId" aria-label="Seleccionar categoría">
                  <mat-option [value]="'all'">Todas</mat-option>
                  <mat-option *ngFor="let c of categorias()" [value]="c.id">{{ c.nombre }}</mat-option>
                </mat-select>
                <mat-hint>Filtra por tipo de producto</mat-hint>
              </mat-form-field>

              <mat-form-field appearance="outline" style="width:100%">
                <mat-label>Producto</mat-label>
                <mat-icon matPrefix class="text-orange-500">restaurant_menu</mat-icon>
                <mat-select [(ngModel)]="productoSelId" aria-label="Seleccionar producto">
                  <mat-option *ngFor="let p of productosFiltrados()" [value]="p.id">{{ p.nombre }}</mat-option>
                </mat-select>
                <mat-hint>Elegí un producto de la lista</mat-hint>
              </mat-form-field>

              <mat-form-field appearance="outline" style="width:100%">
                <mat-label>Cantidad</mat-label>
                <mat-icon matPrefix class="text-orange-500">counter_1</mat-icon>
                <input matInput type="number" min="1" [(ngModel)]="cantidad" aria-label="Cantidad" />
                <mat-hint>Valor mínimo 1</mat-hint>
              </mat-form-field>

              <button mat-raised-button color="primary" class="w-full !h-12 !font-semibold shadow-md" (click)="agregar()" [disabled]="!productoSelId">
                <mat-icon>add_circle</mat-icon>&nbsp;Agregar al pedido
              </button>
            </div>
          </div>

          <!-- Resumen -->
          <div class="mt-4 bg-white/90 backdrop-blur-xl rounded-2xl shadow border border-white/60 overflow-hidden">
            <div class="px-4 py-3 border-b text-gray-800 font-semibold flex items-center gap-2">
              <mat-icon class="text-orange-600">summarize</mat-icon>
              Resumen
            </div>
            <div class="p-4 space-y-3 text-sm">
              <div class="flex items-center justify-between">
                <span class="text-gray-600">Ítems</span>
                <span class="font-medium text-gray-900">{{ (pedido()?.items || []).length }}</span>
              </div>
              <div class="flex items-center justify-between border-t pt-3">
                <span class="text-gray-700">Total</span>
                <span class="text-lg font-extrabold text-gray-900">$ {{ pedido()?.pedido?.total | number:'1.2-2' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom actions -->
    <div class="sticky bottom-0 z-40 bg-white/90 backdrop-blur-xl border-t shadow-inner">
      <div class="px-3 py-3 grid grid-cols-3 gap-2 md:max-w-3xl md:mx-auto">
        <button mat-stroked-button color="accent" class="!h-12 !font-semibold" (click)="pagar('efectivo')"><mat-icon>attach_money</mat-icon>&nbsp;Efectivo</button>
        <button mat-stroked-button color="accent" class="!h-12 !font-semibold" (click)="pagar('tarjeta')"><mat-icon>credit_card</mat-icon>&nbsp;Tarjeta</button>
        <button mat-stroked-button color="accent" class="!h-12 !font-semibold" (click)="pagar('qr')"><mat-icon>qr_code</mat-icon>&nbsp;QR</button>
      </div>
    </div>
  </div>
  `,
  styles: [`
    /* Mantener soporte desktop simple si no hay Tailwind */
    @media (min-width: 1024px) {
      :host { display: block; }
    }
  `]
})
export class PedidoComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(MapaSalonApiService);
  private router = inject(Router);

  pedido = signal<{ pedido: any; items: any[] } | null>(null);
  categorias = signal<any[]>([]);
  productos = signal<any[]>([]);

  productoSelId: number | null = null;
  cantidad = 1;
  busqueda = '';
  catSelId: number | 'all' = 'all';

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id')) || 0;
    if (id > 0) this.cargar(id);
    this.api.listarProductos().subscribe({
      next: (res) => {
        this.categorias.set(res.categorias || []);
        this.productos.set(res.productos || []);
      },
    });
  }

  productosPorCat(catId: number) {
    return (this.productos() || []).filter(p => p.categoria_id === catId);
  }

  productosFiltrados() {
    const txt = (this.busqueda || '').toLowerCase();
    return (this.productos() || [])
      .filter(p => (this.catSelId === 'all' ? true : p.categoria_id === this.catSelId))
      .filter(p => !txt || (p.nombre || '').toLowerCase().includes(txt));
  }

  cargar(id: number) {
    this.api.pedidoDetalle(id).subscribe({
      next: (res) => this.pedido.set(res),
    });
  }

  agregar() {
    const ped = this.pedido();
    if (!ped || !this.productoSelId) return;
    this.api.agregarItem(ped.pedido.id, this.productoSelId, this.cantidad || 1).subscribe({
      next: () => this.cargar(ped.pedido.id)
    });
  }

  pagar(metodo: 'efectivo'|'tarjeta'|'qr'|'mixto') {
    const ped = this.pedido();
    if (!ped) return;
    this.api.pagarPedido(ped.pedido.id, metodo).subscribe({
      next: () => this.router.navigate(['/comandera/pedidos'])
    });
  }

  volver() { this.router.navigate(['/comandera/pedidos']); }
}
