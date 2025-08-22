import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MapaSalonApi {
  private base = environment.apiBase || '';

  constructor(private http: HttpClient) {}

  // Models
  getEstado(area: 'interior' | 'exterior'): Observable<EstadoMesasResponse> {
    return this.http.get<EstadoMesasResponse>(`${this.base}/api/mesas/status.php`, {
      params: { area }
    });
  }

  abrirMesa(body: AbrirMesaBody): Observable<{ ok: boolean; pedidoId: number; yaOcupada?: boolean }>{
    return this.http.post<{ ok: boolean; pedidoId: number; yaOcupada?: boolean }>(`${this.base}/api/mesas/abrir.php`, body);
  }

  liberarMesa(body: LiberarMesaBody): Observable<{ ok: boolean; creada?: boolean; yaLibre?: boolean }>{
    return this.http.post<{ ok: boolean; creada?: boolean; yaLibre?: boolean }>(`${this.base}/api/mesas/liberar.php`, body);
  }

  pagar(body: PagarBody): Observable<{ ok: boolean }>{
    return this.http.post<{ ok: boolean }>(`${this.base}/api/mesas/pagar.php`, body);
  }

  getPedido(pedidoId: number): Observable<{ pedido: any; items: any[] }>{
    return this.http.get<{ pedido: any; items: any[] }>(`${this.base}/api/mesas/pedido.php`, { params: { pedidoId } as any });
  }

  agregarItem(body: AgregarItemBody): Observable<{ ok: boolean }>{
    return this.http.post<{ ok: boolean }>(`${this.base}/api/mesas/agregar-item.php`, body);
  }
}

// Types
export interface EstadoMesasResponse {
  area: 'interior' | 'exterior';
  mesas: MesaEstado[];
}

export interface MesaEstado {
  mesaId: string;
  estado: 'libre' | 'ocupada';
  pedidoId: number | null;
  pedidoEstado?: string;
  pagado?: boolean;
}

export interface AbrirMesaBody {
  area: 'interior' | 'exterior';
  mesaId: string;
  token?: string;
}

export interface LiberarMesaBody {
  area: 'interior' | 'exterior';
  mesaId: string;
  token?: string;
}

export interface PagarBody {
  pedidoId: number;
  metodo?: string;
  monto?: number | null;
  token?: string;
}

export interface AgregarItemBody {
  pedidoId: number;
  productoId: number;
  cantidad?: number;
  token?: string;
}
