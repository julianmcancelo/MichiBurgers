import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MapaSalonApiService } from '../../../mapa-meses/services/mapa-salon-api.service';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatListModule, MatButtonModule, MatIconModule],
  template: `
    <div
      class="min-h-[100svh] bg-gradient-to-br from-gray-50 via-white to-orange-50 px-3 py-4 md:px-6 md:py-6"
    >
      <mat-card
        class="bg-white/90 backdrop-blur border border-orange-100 shadow-xl overflow-hidden"
      >
        <div
          class="px-4 py-4 md:px-6 md:py-5 border-b bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 text-white"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shadow">
                <mat-icon class="text-white">receipt_long</mat-icon>
              </div>
              <div>
                <div class="text-lg md:text-xl font-bold leading-tight">Órdenes</div>
                <div class="text-white/90 text-xs">Gestión de pedidos abiertos</div>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button mat-stroked-button color="accent" (click)="refrescar()">
                <mat-icon>refresh</mat-icon>&nbsp;Refrescar
              </button>
            </div>
          </div>
        </div>

        <div class="p-3 md:p-4">
          <div *ngIf="pedidos().length === 0; else lista" class="py-10 text-center text-gray-500">
            <div
              class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 text-sm"
            >
              <mat-icon>inbox</mat-icon>
              Sin pedidos abiertos
            </div>
          </div>
          <ng-template #lista>
            <mat-list>
              <div class="divide-y">
                <div
                  *ngFor="let p of pedidos()"
                  (click)="irPedido(p.pedidoId)"
                  class="flex items-center justify-between gap-3 py-3 px-1 cursor-pointer hover:bg-orange-50 rounded-lg transition-colors"
                >
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-2">
                      <span
                        class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-700 text-sm font-bold"
                        >{{ p.pedidoId }}</span
                      >
                      <div class="font-medium text-gray-900 truncate">Pedido #{{ p.pedidoId }}</div>
                    </div>
                    <div class="text-xs text-gray-500 mt-0.5">
                      Mesa {{ p.mesaId }} • {{ p.area }}
                    </div>
                  </div>
                  <mat-icon class="text-gray-400">chevron_right</mat-icon>
                </div>
              </div>
            </mat-list>
          </ng-template>
        </div>
      </mat-card>
    </div>
  `,
  styles: [
    `
      /* No extra CSS needed; Tailwind used for layout */
    `,
  ],
})
export class PedidosComponent implements OnInit, OnDestroy {
  constructor(
    private api: MapaSalonApiService,
    private router: Router,
  ) {}

  pedidos = signal<{ area: 'interior' | 'exterior'; mesaId: string; pedidoId: number }[]>([]);
  private poll?: any;

  ngOnInit(): void {
    this.cargar();
    this.poll = setInterval(() => this.cargar(), 3000);
  }

  ngOnDestroy(): void {
    if (this.poll) clearInterval(this.poll);
  }

  refrescar() {
    this.cargar();
  }

  private cargar() {
    // Traer estados de ambas áreas y quedarnos con ocupadas con pedidoId
    this.api.getEstadoMesas('interior').subscribe({
      next: (interior) => {
        this.api.getEstadoMesas('exterior').subscribe({
          next: (exterior) => {
            const it = (interior || []).filter((m) => m.estado === 'ocupada' && m.pedidoId);
            const ex = (exterior || []).filter((m) => m.estado === 'ocupada' && m.pedidoId);
            const lista = [
              ...it.map((m) => ({
                area: 'interior' as const,
                mesaId: m.mesaId,
                pedidoId: Number(m.pedidoId),
              })),
              ...ex.map((m) => ({
                area: 'exterior' as const,
                mesaId: m.mesaId,
                pedidoId: Number(m.pedidoId),
              })),
            ];
            this.pedidos.set(lista);
          },
        });
      },
    });
  }

  irPedido(id: number) {
    this.router.navigate(['/comandera/pedido', id]);
  }
}
