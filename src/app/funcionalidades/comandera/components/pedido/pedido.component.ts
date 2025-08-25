import { CommonModule } from '@angular/common';
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
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';

import { MapaSalonApiService } from '../../../mapa-meses/services/mapa-salon-api.service';

@Component({
  selector: 'app-pedido',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div class="hidden md:flex items-center gap-2 text-white/90 text-sm">
              <span>Órdenes</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
              </svg>
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
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
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
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
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
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
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
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Agregar producto
              </div>
              <div class="p-4 space-y-3 sm:space-y-4 pedido-form">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div class="relative sm:col-span-2">
                    <label for="search-input" class="sr-only">Buscar</label>
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </span>
                    <input id="search-input" type="text" [(ngModel)]="busqueda" placeholder="Nombre del producto..." [disabled]="isPagado()" class="w-full h-12 pl-10 pr-4 bg-orange-50/60 border border-orange-200/80 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors" />
                    <p class="text-xs text-gray-500 mt-1 pl-2">Podés escribir parte del nombre</p>
                  </div>

                  <div class="relative">
                    <label for="category-select" class="sr-only">Categoría</label>
                     <span class="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500 pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </span>
                    <select id="category-select" [(ngModel)]="catSelId" [disabled]="isPagado()" class="w-full h-12 pl-10 pr-4 bg-orange-50/60 border border-orange-200/80 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors appearance-none">
                      <option [value]="'all'">Todas</option>
                      <option *ngFor="let c of categorias()" [value]="c.id">{{ c.nombre }}</option>
                    </select>
                  </div>

                  <div class="relative sm:col-span-2">
                    <label for="product-select" class="sr-only">Producto</label>
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500 pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v11.494m0 0a7.5 7.5 0 0010.607 0M12 17.747a7.5 7.5 0 01-10.607 0M12 6.253a7.5 7.5 0 0110.607 0M12 6.253a7.5 7.5 0 00-10.607 0" />
                      </svg>
                    </span>
                    <select id="product-select" [(ngModel)]="productoSelId" [disabled]="isPagado()" class="w-full h-12 pl-10 pr-4 bg-orange-50/60 border border-orange-200/80 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors appearance-none">
                      <option *ngFor="let p of productosFiltrados()" [value]="p.id">{{ p.nombre }}</option>
                    </select>
                  </div>

                  <div class="relative">
                     <label for="quantity-input" class="sr-only">Cantidad</label>
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </span>
                    <input id="quantity-input" type="number" min="1" [(ngModel)]="cantidad" [disabled]="isPagado()" class="w-full h-12 pl-10 pr-4 bg-orange-50/60 border border-orange-200/80 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors" />
                  </div>
                </div>

                <button
                  (click)="agregar()"
                  [disabled]="!productoSelId || isPagado()"
                  class="w-full h-12 flex items-center justify-center gap-2 font-semibold text-white bg-orange-600 rounded-xl shadow-md hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Agregar al pedido</span>
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
                <svg xmlns="http://www.w.w3.org/2000/svg" class="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
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
          <button (click)="confirmarPago('efectivo')" class="h-12 flex items-center justify-center gap-2 font-semibold text-orange-700 bg-orange-100 rounded-xl hover:bg-orange-200 transition-colors border border-orange-200">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 6v-1h4a2 2 0 012 2v11a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2h4z" />
            </svg>
            <span>Efectivo</span>
          </button>
          <button (click)="confirmarPago('tarjeta')" class="h-12 flex items-center justify-center gap-2 font-semibold text-orange-700 bg-orange-100 rounded-xl hover:bg-orange-200 transition-colors border border-orange-200">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <span>Tarjeta</span>
          </button>
          <button (click)="confirmarPago('qr')" class="h-12 flex items-center justify-center gap-2 font-semibold text-orange-700 bg-orange-100 rounded-xl hover:bg-orange-200 transition-colors border border-orange-200">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v1m6 11h2m-6.5 6.5v-2.5m-4 0v2.5m-4 0h-2m14 0h2M4 12H2M4 4l1.5 1.5M18.5 5.5L20 4m-16 8l-1.5 1.5M18.5 18.5L20 20M4 20l1.5-1.5M18.5 18.5L20 20" />
            </svg>
            <span>QR</span>
          </button>
        </div>
      </div>

      <!-- Diálogo: Confirmar cobro -->
      <ng-template #dlgConfirmCobro>
        <div class="p-5 pt-4 max-w-[420px]">
          <div class="flex items-center gap-2 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 class="text-lg font-semibold text-gray-900">Confirmar cobro</h3>
          </div>
          <p class="text-sm text-gray-600 mb-4">¿Se cobró correctamente?</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button (click)="dialogRef?.close(true)" class="h-11 flex items-center justify-center gap-2 font-semibold text-white bg-orange-600 rounded-xl shadow-md hover:bg-orange-700 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>Sí, cobrado</span>
            </button>
            <button (click)="dialogRef?.close(false)" class="h-11 flex items-center justify-center gap-2 font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors border border-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>No, cancelar</span>
            </button>
          </div>
        </div>
      </ng-template>

      <!-- Diálogo: ¿Liberar mesa o seguir ocupada? -->
      <ng-template #dlgPostPago>
        <div class="p-5 pt-4 max-w-[420px]">
          <div class="flex items-center gap-2 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            <h3 class="text-lg font-semibold text-gray-900">Pago registrado</h3>
          </div>
          <p class="text-sm text-gray-600 mb-4">
            ¿Cómo querés continuar con la mesa {{ pedido()?.pedido?.mesa_id }}?
          </p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button (click)="dialogRef?.close('liberar')" class="h-11 flex items-center justify-center gap-2 font-semibold text-white bg-orange-600 rounded-xl shadow-md hover:bg-orange-700 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Terminar y liberar</span>
            </button>
            <button (click)="dialogRef?.close('seguir')" class="h-11 flex items-center justify-center gap-2 font-semibold text-orange-700 bg-orange-100 rounded-xl hover:bg-orange-200 transition-colors border border-orange-200">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16 8v8m-3-5v5m-3-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Seguir ocupada</span>
            </button>
          </div>
        </div>
      </ng-template>

      <!-- Diálogo: Factura / Resumen -->
      <ng-template #dlgFactura>
        <div class="p-5 pt-4 max-w-[520px]">
          <div class="flex items-center gap-2 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
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
            <button (click)="dialogRef?.close()" class="h-11 flex items-center justify-center gap-2 font-semibold text-orange-700 bg-orange-100 rounded-xl hover:bg-orange-200 transition-colors border border-orange-200">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Cerrar</span>
            </button>
            <button (click)="confirmarPagoDesdeFactura('efectivo')" class="h-11 flex items-center justify-center gap-2 font-semibold text-orange-700 bg-orange-100 rounded-xl hover:bg-orange-200 transition-colors border border-orange-200">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 6v-1h4a2 2 0 012 2v11a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2h4z" />
              </svg>
              <span>Efectivo</span>
            </button>
            <button (click)="confirmarPagoDesdeFactura('tarjeta')" class="h-11 flex items-center justify-center gap-2 font-semibold text-white bg-orange-600 rounded-xl shadow-md hover:bg-orange-700 transition-colors sm:col-span-1">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span>Tarjeta</span>
            </button>
            <button (click)="confirmarPagoDesdeFactura('qr')" class="h-11 flex items-center justify-center gap-2 font-semibold text-white bg-orange-600 rounded-xl shadow-md hover:bg-orange-700 transition-colors sm:col-span-1">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v1m6 11h2m-6.5 6.5v-2.5m-4 0v2.5m-4 0h-2m14 0h2M4 12H2M4 4l1.5 1.5M18.5 5.5L20 4m-16 8l-1.5 1.5M18.5 18.5L20 20M4 20l1.5-1.5M18.5 18.5L20 20" />
              </svg>
              <span>QR</span>
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
    refConfirm.afterClosed().subscribe((cobrado: boolean) => {
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
