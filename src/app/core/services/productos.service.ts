import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { map, Observable } from 'rxjs';

export interface Categoria {
  id: number;
  nombre: string;
  orden: number;
}

export interface Producto {
  id: number;
  categoria_id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  activo: number;
  imagen_url: string;
}

export interface MenuData {
  categorias: Categoria[];
  productos: Producto[];
}

@Injectable({
  providedIn: 'root',
})
export class ProductosService {
  // Base tomada del environment para evitar typos y mantener un único origen
  private apiUrl = `${environment.apiUrl}/productos`;
  // Base absoluta para recursos (imágenes) servidos por el backend PHP
  private assetBase = environment.production
    ? environment.apiUrl
    : 'https://burguersaurio.jcancelo.dev/api';

  constructor(private http: HttpClient) {}

  getMenu(): Observable<MenuData> {
    return this.http.get<MenuData>(`${this.apiUrl}/listar.php`).pipe(
      map((data) => ({
        categorias: (data.categorias || []).map(c => ({
          ...c,
          id: typeof c.id === 'string' ? Number(c.id) : c.id,
          orden: typeof c.orden === 'string' ? Number(c.orden) : c.orden,
        })),
        productos: (data.productos || []).map(p => ({
          ...p,
          // normalizar tipos numéricos que pueden venir como string
          id: typeof p.id === 'string' ? Number(p.id) : p.id,
          categoria_id: typeof p.categoria_id === 'string' ? Number(p.categoria_id) : p.categoria_id,
          activo: typeof p.activo === 'string' ? Number(p.activo) : p.activo,
          // asegurar número para evitar errores en currency pipe
          precio: typeof p.precio === 'string' ? Number(p.precio) : p.precio,
          // prefijar imágenes relativas para que carguen desde el backend
          imagen_url:
            p.imagen_url && !/^https?:\/\//i.test(p.imagen_url)
              ? `${this.assetBase}/${p.imagen_url.replace(/^\/?/, '')}`
              : p.imagen_url,
        })),
      }))
    );
  }
}
