import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-preparacion',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Pantalla de cocina estilo TV -->
    <div class="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-orange-900 p-4">
      <!-- Header principal -->
      <div class="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border-4 border-white mb-6 overflow-hidden">
        <div class="bg-gradient-to-r from-red-600 via-red-700 to-orange-600 px-8 py-6 text-center">
          <div class="flex items-center justify-center gap-4 mb-4">
            <div class="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21.17,4.25a.84.84,0,0,0-.33-.48.89.89,0,0,0-.55-.17H3.71a.89.89,0,0,0-.55.17.84.84,0,0,0-.33.48.83.83,0,0,0,.13.65L5.4,8.22V20a1,1,0,0,0,1,1H17.6a1,1,0,0,0,1-1V8.22l2.44-3.32A.83.83,0,0,0,21.17,4.25ZM7.51,20V12.41L6,10.36V8.78H18v1.58L16.49,12.41V20Z"/>
              </svg>
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
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
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
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7.014A8.003 8.003 0 0112 3c1.398 0 2.743.57 3.714 1.543C18.5 6.5 19 9 19 11c2 1 2.657 1.657 2.657 2.657a8 8 0 01-11.314 5z" />
                </svg>
                </div>
                <div class="flex-1">
                  <h3 class="font-black text-gray-900 text-lg">Burger Clásica</h3>
                  <p class="text-red-600 font-semibold">x2 - Sin cebolla</p>
                </div>
              </div>
              <div class="flex items-center gap-4 p-4 bg-orange-50 rounded-xl border-2 border-orange-200">
                <div class="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8 21h8M12 15v6M4.5 10h15M6 10l1.25-5.625A2 2 0 019.12 3h5.76a2 2 0 011.87 1.375L18 10" />
                </svg>
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
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
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
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7.014A8.003 8.003 0 0112 3c1.398 0 2.743.57 3.714 1.543C18.5 6.5 19 9 19 11c2 1 2.657 1.657 2.657 2.657a8 8 0 01-11.314 5z" />
                </svg>
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
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M18.364 5.636a9 9 0 010 12.728m-12.728 0a9 9 0 010-12.728m12.728 0L12 12l-6.364-6.364m12.728 12.728L12 12l6.364 6.364z" />
                </svg>
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
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7.014A8.003 8.003 0 0112 3c1.398 0 2.743.57 3.714 1.543C18.5 6.5 19 9 19 11c2 1 2.657 1.657 2.657 2.657a8 8 0 01-11.314 5z" />
                </svg>
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
            <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div class="text-3xl font-black">3</div>
            <div class="text-red-100 font-semibold">URGENTES</div>
          </div>
          <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div class="text-3xl font-black">5</div>
            <div class="text-green-100 font-semibold">PENDIENTES</div>
          </div>
          <div class="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-6 text-white">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M18.364 5.636a9 9 0 010 12.728m-12.728 0a9 9 0 010-12.728m12.728 0L12 12l-6.364-6.364m12.728 12.728L12 12l6.364 6.364z" />
            </svg>
            <div class="text-3xl font-black">2</div>
            <div class="text-yellow-100 font-semibold">PREPARANDO</div>
          </div>
          <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
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
