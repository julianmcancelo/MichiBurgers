import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { PedidoClienteState } from './pedido-cliente.service';

export interface CrearPedidoPayload {
  area: 'interior' | 'exterior';
  mesa_id: string | number;
  cliente_nombre: string;
  cliente_telefono: string;
  items: { [productoId: number]: number };
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

@Injectable({
  providedIn: 'root',
})
export class PedidoApiService {
  // Tomar base del environment para evitar typos y centralizar config
  private apiUrl = `${environment.apiUrl}/cliente`;

  constructor(private http: HttpClient) {}

  crearPedido(payload: CrearPedidoPayload): Observable<CrearPedidoResponse> {
    return this.http.post<CrearPedidoResponse>(
      `${this.apiUrl}/crear-pedido.php`,
      payload
    );
  }

  confirmarPago(payload: ConfirmarPagoPayload): Observable<any> {
    return this.http.post(`${this.apiUrl}/confirmar-pago.php`, payload);
  }
}
