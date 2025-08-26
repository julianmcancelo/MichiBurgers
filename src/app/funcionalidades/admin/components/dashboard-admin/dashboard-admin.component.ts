import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard-admin',
  standalone: false,
  template: `
  <div class="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 p-4 sm:p-6 lg:p-8">
    <div class="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl border border-emerald-100 overflow-hidden">
      <div class="bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 px-6 py-6">
        <h1 class="text-2xl font-bold text-white tracking-wide">Gestión de Productos</h1>
        <p class="text-emerald-100">Administra el menú de MichiBurgers</p>
      </div>

      <div class="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <a routerLink="/admin/nuevo" class="block p-4 rounded-xl border border-emerald-200 hover:bg-emerald-50">
          <div class="font-semibold text-emerald-800">Nuevo Producto</div>
          <div class="text-sm text-emerald-700/80">Crear un nuevo ítem del menú</div>
        </a>

        <a routerLink="/admin/usuarios/registrar" class="block p-4 rounded-xl border border-emerald-200 hover:bg-emerald-50">
          <div class="font-semibold text-emerald-800">Registrar Usuario</div>
          <div class="text-sm text-emerald-700/80">Alta de usuarios administradores</div>
        </a>

        <a routerLink="/admin/pagos/transferencias" class="block p-4 rounded-xl border border-emerald-200 hover:bg-emerald-50">
          <div class="font-semibold text-emerald-800">Revisar Transferencias</div>
          <div class="text-sm text-emerald-700/80">Aprobar o rechazar comprobantes</div>
        </a>

        <a routerLink="/admin/productos" class="block p-4 rounded-xl border border-emerald-200 hover:bg-emerald-50">
          <div class="font-semibold text-emerald-800">Listar Productos</div>
          <div class="text-sm text-emerald-700/80">Ver y administrar productos</div>
        </a>
      </div>
    </div>
  </div>
  `,
})
export class DashboardAdminComponent {}
