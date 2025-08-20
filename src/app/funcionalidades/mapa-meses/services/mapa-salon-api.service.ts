import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';

// Usar el dominio público en producción
const BASE_URL = 'https://burguersaurio.jcancelo.dev/api';

@Injectable({ providedIn: 'root' })
export class MapaSalonApiService {
  constructor(private http: HttpClient) {}

  getLayout(area: 'interior' | 'exterior'): Observable<any[]> {
    const params = new HttpParams().set('area', area);
    return this.http
      .get<{ area: string; data: any[]; updated_at?: string }>(`${BASE_URL}/layouts.php`, { params })
      .pipe(map((res) => res?.data ?? []));
  }

  saveLayout(area: 'interior' | 'exterior', mesas: any[]): Observable<boolean> {
    const params = new HttpParams().set('area', area);
    return this.http
      .put(`${BASE_URL}/layouts.php`, mesas, { params })
      .pipe(map(() => true));
  }

  // ===== Mesas / Pedidos =====
  getEstadoMesas(area: 'interior'|'exterior'): Observable<{ mesaId: string; estado: 'libre'|'ocupada'; pedidoId?: number|null }[]> {
    const params = new HttpParams().set('area', area);
    return this.http
      .get<{ area: string; mesas: any[] }>(`${BASE_URL}/mesas/status.php`, { params })
      .pipe(map(res => res.mesas ?? []));
  }

  abrirMesa(area: 'interior'|'exterior', mesaId: string): Observable<{ ok: boolean; pedidoId: number }>{
    const token = typeof window !== 'undefined' ? (localStorage.getItem('auth_token') || '') : '';
    return this.http.post<{ ok: boolean; pedidoId: number }>(`${BASE_URL}/mesas/abrir.php`, { area, mesaId, token });
  }

  pedidoDetalle(pedidoId: number): Observable<{ pedido: any; items: any[] }>{
    const params = new HttpParams().set('pedidoId', String(pedidoId));
    return this.http.get<{ pedido: any; items: any[] }>(`${BASE_URL}/mesas/pedido.php`, { params });
  }

  agregarItem(pedidoId: number, productoId: number, cantidad = 1): Observable<{ ok: boolean }>{
    const token = typeof window !== 'undefined' ? (localStorage.getItem('auth_token') || '') : '';
    return this.http.post<{ ok: boolean }>(`${BASE_URL}/mesas/agregar-item.php`, { pedidoId, productoId, cantidad, token });
  }

  pagarPedido(pedidoId: number, metodo: 'efectivo'|'tarjeta'|'qr'|'mixto' = 'efectivo', monto?: number): Observable<{ ok: boolean }>{
    const token = typeof window !== 'undefined' ? (localStorage.getItem('auth_token') || '') : '';
    return this.http.post<{ ok: boolean }>(`${BASE_URL}/mesas/pagar.php`, { pedidoId, metodo, monto, token });
  }

  listarProductos(): Observable<{ categorias: any[]; productos: any[] }>{
    return this.http.get<{ categorias: any[]; productos: any[] }>(`${BASE_URL}/productos/listar.php`);
  }
}
