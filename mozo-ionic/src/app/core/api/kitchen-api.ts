import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class KitchenApi {
  private base = environment.apiBase || '';
  constructor(private http: HttpClient) {}

  listarPendientes(): Observable<PedidoCocina[]> {
    return this.http.get<PedidoCocina[]>(`${this.base}/api/cocina/pedidos.php`);
  }

  actualizarEstado(body: ActualizarEstadoBody): Observable<{ ok: boolean }> {
    return this.http.post<{ ok: boolean }>(`${this.base}/api/cocina/actualizar-estado.php`, body);
  }
}

export interface PedidoCocina {
  pedidoId: number;
  mesa?: string;
  mozo?: string;
  hora?: string;
  items: ItemCocina[];
}

export interface ItemCocina {
  itemId: number;
  producto: string;
  cantidad: number;
  notas?: string;
  estado: 'pendiente' | 'preparando' | 'listo';
}

export interface ActualizarEstadoBody {
  itemId: number;
  estado: 'preparando' | 'listo';
}
