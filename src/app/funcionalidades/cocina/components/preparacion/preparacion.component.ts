import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-preparacion',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule],
  template: `
    <!-- Pantalla de cocina estilo TV -->
    <div class="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-orange-900 p-4">
      <!-- Header principal -->
      <div class="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border-4 border-white mb-6 overflow-hidden">
        <div class="bg-gradient-to-r from-red-600 via-red-700 to-orange-600 px-8 py-6 text-center">
          <div class="flex items-center justify-center gap-4 mb-4">
            <div class="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center shadow-lg">
              <mat-icon class="text-white text-4xl">restaurant</mat-icon>
            </div>
            <div class="text-left">
              <h1 class="text-4xl font-black text-white tracking-wide">COCINA</h1>
              <p class="text-red-100 text-lg font-semibold">MichiBurgers</p>
            </div>
          </div>
          <div class="bg-white/10 rounded-xl px-6 py-3 inline-block">
            <p class="text-white text-xl font-bold">{{ getCurrentTime() }}</p>
          </div>
        </div>
      </div>

      <!-- Grid de pedidos -->
      <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
        <!-- Pedido Urgente -->
        <div class="bg-white rounded-2xl shadow-2xl border-4 border-red-500 overflow-hidden transform hover:scale-105 transition-all duration-300">
          <div class="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <mat-icon class="text-white text-lg">priority_high</mat-icon>
                </div>
                <span class="text-white font-black text-xl">MESA 5</span>
              </div>
              <div class="bg-white/20 rounded-lg px-3 py-1">
                <span class="text-white font-bold text-sm">15:30</span>
              </div>
            </div>
          </div>
          <div class="p-6">
            <div class="space-y-4">
              <div class="flex items-center gap-4 p-4 bg-red-50 rounded-xl border-2 border-red-200">
                <div class="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                  <mat-icon class="text-white text-lg">lunch_dining</mat-icon>
                </div>
                <div class="flex-1">
                  <h3 class="font-black text-gray-900 text-lg">Burger Clásica</h3>
                  <p class="text-red-600 font-semibold">x2 - Sin cebolla</p>
                </div>
              </div>
              <div class="flex items-center gap-4 p-4 bg-orange-50 rounded-xl border-2 border-orange-200">
                <div class="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                  <mat-icon class="text-white text-lg">local_drink</mat-icon>
                </div>
                <div class="flex-1">
                  <h3 class="font-black text-gray-900 text-lg">Papas Fritas</h3>
                  <p class="text-orange-600 font-semibold">x2 - Grande</p>
                </div>
              </div>
            </div>
            <button class="w-full mt-6 bg-gradient-to-r from-red-500 to-red-600 text-white font-black py-4 rounded-xl text-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg">
              MARCAR LISTO
            </button>
          </div>
        </div>

        <!-- Pedido Normal -->
        <div class="bg-white rounded-2xl shadow-2xl border-4 border-green-500 overflow-hidden transform hover:scale-105 transition-all duration-300">
          <div class="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <mat-icon class="text-white text-lg">schedule</mat-icon>
                </div>
                <span class="text-white font-black text-xl">MESA 3</span>
              </div>
              <div class="bg-white/20 rounded-lg px-3 py-1">
                <span class="text-white font-bold text-sm">15:45</span>
              </div>
            </div>
          </div>
          <div class="p-6">
            <div class="space-y-4">
              <div class="flex items-center gap-4 p-4 bg-green-50 rounded-xl border-2 border-green-200">
                <div class="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                  <mat-icon class="text-white text-lg">lunch_dining</mat-icon>
                </div>
                <div class="flex-1">
                  <h3 class="font-black text-gray-900 text-lg">Burger Especial</h3>
                  <p class="text-green-600 font-semibold">x1 - Extra queso</p>
                </div>
              </div>
            </div>
            <button class="w-full mt-6 bg-gradient-to-r from-green-500 to-green-600 text-white font-black py-4 rounded-xl text-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg">
              MARCAR LISTO
            </button>
          </div>
        </div>

        <!-- Pedido Preparando -->
        <div class="bg-white rounded-2xl shadow-2xl border-4 border-yellow-500 overflow-hidden transform hover:scale-105 transition-all duration-300">
          <div class="bg-gradient-to-r from-yellow-500 to-yellow-600 px-6 py-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <mat-icon class="text-white text-lg">hourglass_top</mat-icon>
                </div>
                <span class="text-white font-black text-xl">MESA 7</span>
              </div>
              <div class="bg-white/20 rounded-lg px-3 py-1">
                <span class="text-white font-bold text-sm">16:00</span>
              </div>
            </div>
          </div>
          <div class="p-6">
            <div class="space-y-4">
              <div class="flex items-center gap-4 p-4 bg-yellow-50 rounded-xl border-2 border-yellow-200">
                <div class="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
                  <mat-icon class="text-white text-lg">lunch_dining</mat-icon>
                </div>
                <div class="flex-1">
                  <h3 class="font-black text-gray-900 text-lg">Burger Doble</h3>
                  <p class="text-yellow-600 font-semibold">x1 - En preparación</p>
                </div>
              </div>
            </div>
            <div class="w-full mt-6 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white font-black py-4 rounded-xl text-lg text-center">
              PREPARANDO...
            </div>
          </div>
        </div>
      </div>

      <!-- Footer con estadísticas -->
      <div class="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border-4 border-white p-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
          <div class="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white">
            <mat-icon class="text-4xl mb-2">priority_high</mat-icon>
            <div class="text-3xl font-black">3</div>
            <div class="text-red-100 font-semibold">URGENTES</div>
          </div>
          <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
            <mat-icon class="text-4xl mb-2">schedule</mat-icon>
            <div class="text-3xl font-black">5</div>
            <div class="text-green-100 font-semibold">PENDIENTES</div>
          </div>
          <div class="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-6 text-white">
            <mat-icon class="text-4xl mb-2">hourglass_top</mat-icon>
            <div class="text-3xl font-black">2</div>
            <div class="text-yellow-100 font-semibold">PREPARANDO</div>
          </div>
          <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
            <mat-icon class="text-4xl mb-2">check_circle</mat-icon>
            <div class="text-3xl font-black">12</div>
            <div class="text-blue-100 font-semibold">COMPLETADOS</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      }
      
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }
      
      .animate-pulse {
        animation: pulse 2s infinite;
      }
    `,
  ],
})
export class PreparacionComponent {
  getCurrentTime(): string {
    return new Date().toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }
}
