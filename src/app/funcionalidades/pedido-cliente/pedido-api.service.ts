import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface CrearPedidoPayload {
  area: 'interior' | 'exterior';
  mesa_id: string | number;
  cliente_nombre: string;
  cliente_telefono: string;
  items: Record<number, number>;
}

export interface CrearPedidoResponse {
  id?: string; // UUID del pedido_cliente (algunas versiones devuelven 'id')
  pedido_id?: string; // otras devuelven 'pedido_id'
}

export interface ConfirmarPagoPayload {
  pedido_cliente_id?: string; // principal
  pedido_id?: string; // compat
  metodo?: 'tarjeta' | 'mercado_pago' | 'transferencia' | 'efectivo' | 'qr' | 'mixto';
  detalles?: any; // se enviará como JSON al backend
  referencia?: string; // último 4 dígitos, nro de operación, etc.
}

export interface MesaEstadoItem {
  mesaId: string;
  estado: 'libre' | 'ocupada';
  pedidoId?: number | null;
  pedidoEstado?: string;
  pagado?: boolean;
}

export interface MesaStatusResponse {
  area: 'interior' | 'exterior';
  mesas: MesaEstadoItem[];
}

@Injectable({
  providedIn: 'root',
})
export class PedidoApiService {
  // Tomar base del environment para evitar typos y centralizar config
  private apiUrl = `${environment.apiUrl}/cliente`;
  private http = inject(HttpClient);

  crearPedido(payload: CrearPedidoPayload): Observable<CrearPedidoResponse> {
    return this.http.post<CrearPedidoResponse>(
      `${this.apiUrl}/crear-pedido.php`,
      payload
    );
  }

  confirmarPago(payload: ConfirmarPagoPayload): Observable<any> {
    return this.http.post(`${this.apiUrl}/confirmar-pago.php`, payload);
  }

  // Estado de mesas por área (usado para mostrar estado actual en el flujo cliente)
  getEstadoMesas(area: 'interior' | 'exterior'): Observable<MesaStatusResponse> {
    // Nota: endpoint está fuera de /cliente
    const url = `${environment.apiUrl}/mesas/status.php?area=${area}`;
    return this.http.get<MesaStatusResponse>(url);
  }
}
