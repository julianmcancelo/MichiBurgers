import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface ProductoDTO {
  id: number;
  categoria_id: number;
  nombre: string;
  descripcion?: string | null;
  precio: number;
  activo: number;
  imagen_url?: string | null;
}

export interface ListarResponse {
  categorias: { id: number; nombre: string; orden: number }[];
  productos: ProductoDTO[];
}

@Injectable({ providedIn: 'root' })
export class ProductosService {
  private base = '/api/productos';
  constructor(private http: HttpClient) {}

  listar(): Observable<ListarResponse> {
    return this.http.get<ListarResponse>(`${this.base}/listar.php`);
  }

  crear(
    data: Partial<ProductoDTO> & { categoria_id: number; nombre: string; precio: number },
  ): Observable<{ ok: boolean; id: number }> {
    return this.http.post<{ ok: boolean; id: number }>(`${this.base}/crear.php`, data);
  }

  actualizar(id: number, data: Partial<ProductoDTO>): Observable<{ ok: boolean }> {
    return this.http.post<{ ok: boolean }>(`${this.base}/actualizar.php`, { id, ...data });
  }

  eliminar(id: number): Observable<{ ok: boolean }> {
    return this.http.post<{ ok: boolean }>(`${this.base}/eliminar.php`, { id });
  }
}
