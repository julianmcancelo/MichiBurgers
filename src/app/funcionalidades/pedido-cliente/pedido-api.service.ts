import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { PedidoClienteState } from './pedido-cliente.service';

export interface CrearPedidoPayload {
  nombre_cliente: string;
  telefono_cliente: string;
  mesa_id: number;
  items: { id: number; cantidad: number }[];
  total: number;
}

export interface CrearPedidoResponse {
  id: string; // UUID del pedido_cliente
  // ... cualquier otro dato que devuelva el backend
}

export interface ConfirmarPagoPayload {
  pedido_cliente_id: string;
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
