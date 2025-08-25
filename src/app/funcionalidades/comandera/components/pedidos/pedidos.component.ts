import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';

import { MapaSalonApiService } from '../../../mapa-meses/services/mapa-salon-api.service';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="min-h-[100svh] bg-gradient-to-br from-gray-50 via-white to-orange-50 px-3 py-4 md:px-6 md:py-6"
    >
      <div
        class="bg-white/90 backdrop-blur border border-orange-100 shadow-xl overflow-hidden rounded-2xl"
      >
        <div
          class="px-4 py-4 md:px-6 md:py-5 border-b bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 text-white"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shadow">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <div class="text-lg md:text-xl font-bold leading-tight">Órdenes</div>
                <div class="text-white/90 text-xs">Gestión de pedidos abiertos</div>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button (click)="refrescar()" class="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-white/10 rounded-lg hover:bg-white/20 transition-colors border border-white/20">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h5M20 20v-5h-5M20 4h-5v5M4 20h5v-5" />
                </svg>
                <span>Refrescar</span>
              </button>
            </div>
          </div>
        </div>

        <div class="p-3 md:p-4">
          <div *ngIf="pedidos().length === 0; else lista" class="py-10 text-center text-gray-500">
            <div
              class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              Sin pedidos abiertos
            </div>
          </div>
          <ng-template #lista>
            <div>
              <div class="divide-y divide-gray-100">
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
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </ng-template>
        </div>
      </div>
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
