import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../../environments/environment';

type EstadoPago = 'pendiente' | 'aprobado' | 'rechazado' | 'todos';

@Component({
  selector: 'app-revisar-transferencias',
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterModule, FormsModule],
  template: `
  <div class="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 p-4 sm:p-6 lg:p-8">
    <div class="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl border border-emerald-100 overflow-hidden">
      <div class="bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 px-6 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 class="text-xl sm:text-2xl font-bold text-white tracking-wide">Revisión de Transferencias</h1>
          <p class="text-emerald-100 text-sm">Verificar y aprobar/rechazar comprobantes</p>
        </div>
        <div class="flex items-center gap-2">
          <select [(ngModel)]="estadoFiltro" (change)="cargar()" class="px-3 py-2 rounded-lg bg-white/90 text-emerald-900 border border-emerald-200">
            <option value="pendiente">Pendientes</option>
            <option value="aprobado">Aprobados</option>
            <option value="rechazado">Rechazados</option>
            <option value="todos">Todos</option>
          </select>
          <button (click)="cargar()" class="px-3 py-2 rounded-lg bg-white/10 text-white border border-white/20 hover:bg-white/20">Refrescar</button>
        </div>
      </div>

      <div class="p-4 sm:p-6">
        <a routerLink="/admin" class="inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-800 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M12.707 14.707a1 1 0 01-1.414 0L6 9.414l5.293-5.293a1 1 0 011.414 1.414L8.414 9.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd"/></svg>
          Volver a Admin
        </a>

        <div *ngIf="loading()" class="px-4 py-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg inline-flex items-center gap-2 mb-4">
          <div class="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          Cargando transferencias...
        </div>
        <div *ngIf="error()" class="px-4 py-3 bg-red-50 text-red-800 border border-red-200 rounded-lg mb-4">{{ error() }}</div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-3 py-2 text-left text-xs font-semibold text-gray-700">Pedido</th>
                <th class="px-3 py-2 text-left text-xs font-semibold text-gray-700">Mesa</th>
                <th class="px-3 py-2 text-left text-xs font-semibold text-gray-700">Cliente</th>
                <th class="px-3 py-2 text-left text-xs font-semibold text-gray-700">Total</th>
                <th class="px-3 py-2 text-left text-xs font-semibold text-gray-700">Comprobante</th>
                <th class="px-3 py-2 text-left text-xs font-semibold text-gray-700">Estado</th>
                <th class="px-3 py-2 text-right text-xs font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-100">
              <tr *ngFor="let t of items()" class="hover:bg-gray-50">
                <td class="px-3 py-2 text-sm">#{{ t.id }}</td>
                <td class="px-3 py-2 text-sm">{{ t.area }} / {{ t.mesa_id }}</td>
                <td class="px-3 py-2 text-sm">
                  <div class="font-medium">{{ t.cliente_nombre || '-' }}</div>
                  <div class="text-gray-500">{{ t.cliente_telefono || '' }}</div>
                </td>
                <td class="px-3 py-2 text-sm font-semibold">\${{ t.total | number:'1.0-0' }}</td>
                <td class="px-3 py-2 text-sm">
                  <ng-container *ngIf="t.pago_detalles_parsed as det">
                    <ng-container *ngIf="det.comprobante as c">
                      <a [href]="c" target="_blank" class="text-emerald-700 hover:underline">Ver comprobante</a>
                    </ng-container>
                    <div *ngIf="!det.comprobante" class="text-gray-500">—</div>
                  </ng-container>
                  <div *ngIf="!t.pago_detalles_parsed" class="text-gray-500">—</div>
                </td>
                <td class="px-3 py-2 text-sm">
                  <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium"
                        [ngClass]="{
                          'bg-yellow-100 text-yellow-800': !t.pago_estado || t.pago_estado==='pendiente',
                          'bg-green-100 text-green-800': t.pago_estado==='aprobado',
                          'bg-red-100 text-red-800': t.pago_estado==='rechazado'
                        }">
                    {{ t.pago_estado || 'pendiente' }}
                  </span>
                </td>
                <td class="px-3 py-2 text-sm text-right">
                  <div class="flex justify-end gap-2">
                    <button (click)="aprobar(t)" [disabled]="t.pago_estado==='aprobado' || loading()"
                            class="px-3 py-1.5 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50">Aprobar</button>
                    <button (click)="rechazar(t)" [disabled]="t.pago_estado==='rechazado' || loading()"
                            class="px-3 py-1.5 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50">Rechazar</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
  `,
})
export class RevisarTransferenciasComponent implements OnInit {
  estadoFiltro: EstadoPago = 'pendiente';
  loading = signal(false);
  error = signal<string | null>(null);
  items = signal<any[]>([]);

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar() {
    this.loading.set(true);
    this.error.set(null);
    const url = `${environment.apiUrl}/admin/pagos/listar-transferencias.php?estado=${encodeURIComponent(this.estadoFiltro)}`;
    this.http.get<any>(url).subscribe({
      next: (res) => {
        this.items.set(res?.data || []);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('listar transferencias', err);
        this.error.set('No se pudieron cargar las transferencias');
        this.loading.set(false);
      },
    });
  }

  aprobar(t: any) {
    if (!confirm(`Aprobar pago por transferencia del pedido #${t.id}?`)) return;
    this.loading.set(true);
    const url = `${environment.apiUrl}/admin/pagos/aprobar-transferencia.php`;
    this.http.post<any>(url, { pedido_id: t.id, revisado_por: 'admin' }).subscribe({
      next: () => { this.cargar(); },
      error: (err) => {
        console.error('aprobar transferencia', err);
        this.error.set('No se pudo aprobar el pago');
        this.loading.set(false);
      }
    });
  }

  rechazar(t: any) {
    const nota = prompt('Motivo del rechazo (opcional):') || null;
    if (!confirm(`Rechazar pago por transferencia del pedido #${t.id}?`)) return;
    this.loading.set(true);
    const url = `${environment.apiUrl}/admin/pagos/rechazar-transferencia.php`;
    this.http.post<any>(url, { pedido_id: t.id, nota, revisado_por: 'admin' }).subscribe({
      next: () => { this.cargar(); },
      error: (err) => {
        console.error('rechazar transferencia', err);
        this.error.set('No se pudo rechazar el pago');
        this.loading.set(false);
      }
    });
  }
}
