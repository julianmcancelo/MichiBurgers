import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { ProductosService, ProductoDTO } from '../../services/productos.service';
import { NuevoProductoDialogComponent } from '../nuevo-producto-dialog/nuevo-producto-dialog.component';

export interface Producto extends ProductoDTO {}

@Component({
  selector: 'app-lista-productos',
  templateUrl: './lista-productos.component.html',
  styleUrls: ['./lista-productos.component.scss'],
  standalone: false,
})
export class ListaProductosComponent {
  columnasTabla: string[] = ['select', 'foto', 'nombre', 'precio', 'activo', 'acciones'];
  productos: Producto[] = [];
  categorias: { id: number; nombre: string; orden: number }[] = [];
  filtered: Producto[] = [];
  loading = true;
  error: string | null = null;
  // filtros
  search = '';
  categoriaId: number | 'todas' = 'todas';
  // selección múltiple
  selectedIds = new Set<number>();

  constructor(
    private router: Router,
    private productosSvc: ProductosService,
    private dialog: MatDialog,
  ) {
    this.cargar();
  }

  cargar(): void {
    this.loading = true;
    this.error = null;
    this.productosSvc.listar().subscribe({
      next: (resp) => {
        this.productos = resp.productos.map((p) => ({ ...p }));
        this.categorias = resp.categorias || [];
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar los productos';
        this.loading = false;
      },
    });
  }

  editarProducto(id: number): void {
    this.router.navigate(['/admin/editar', id]);
  }

  eliminarProducto(id: number): void {
    this.productosSvc.eliminar(id).subscribe({
      next: () => {
        this.productos = this.productos.filter((producto) => producto.id !== id);
        this.applyFilters();
      },
      error: () => {
        this.error = 'No se pudo eliminar el producto';
      },
    });
  }

  nuevoProducto(): void {
    const ref = this.dialog.open(NuevoProductoDialogComponent, {
      width: '520px',
      panelClass: 'tight-dialog',
      disableClose: true,
    });
    ref.afterClosed().subscribe((res) => {
      if (res?.ok) this.cargar();
    });
  }

  onImgError(ev: Event): void {
    const img = ev.target as HTMLImageElement | null;
    if (img && img.src !== '/favicon.ico') {
      img.src = '/favicon.ico';
    }
  }

  // Filtros y selección
  applyFilters(): void {
    const term = this.search.trim().toLowerCase();
    this.filtered = this.productos.filter((p) => {
      const matchesTerm = !term || p.nombre.toLowerCase().includes(term);
      const matchesCat = this.categoriaId === 'todas' || p.categoria_id === this.categoriaId;
      return matchesTerm && matchesCat;
    });
    // Si el filtro cambia, limpiar selección de elementos no visibles
    const visibleIds = new Set(this.filtered.map((p) => p.id));
    this.selectedIds.forEach((id) => { if (!visibleIds.has(id)) this.selectedIds.delete(id); });
  }

  toggleAllVisible(): void {
    const allSelected = this.filtered.every((p) => this.selectedIds.has(p.id));
    if (allSelected) {
      this.filtered.forEach((p) => this.selectedIds.delete(p.id));
    } else {
      this.filtered.forEach((p) => this.selectedIds.add(p.id));
    }
  }

  toggleOne(id: number): void {
    if (this.selectedIds.has(id)) this.selectedIds.delete(id);
    else this.selectedIds.add(id);
  }

  get anySelected(): boolean {
    return this.selectedIds.size > 0;
  }

  get allVisibleSelected(): boolean {
    return this.filtered.length > 0 && this.filtered.every((p) => this.selectedIds.has(p.id));
  }

  // Acciones rápidas
  toggleActivo(p: Producto): void {
    const nuevo = p.activo ? 0 : 1;
    this.productosSvc.actualizar(p.id, { activo: nuevo }).subscribe({
      next: () => {
        p.activo = nuevo;
      },
    });
  }

  duplicarProducto(p: Producto): void {
    const payload = {
      nombre: `${p.nombre} (copia)`,
      categoria_id: p.categoria_id,
      precio: p.precio,
      descripcion: p.descripcion ?? '',
      imagen_url: p.imagen_url ?? '',
      activo: p.activo,
    } as Partial<ProductoDTO> & { categoria_id: number; nombre: string; precio: number };
    this.productosSvc.crear(payload).subscribe({
      next: () => this.cargar(),
    });
  }

  // Acciones masivas
  bulkActivar(): void {
    const ids = Array.from(this.selectedIds);
    ids.forEach((id) => this.productosSvc.actualizar(id, { activo: 1 }).subscribe());
    // Optimista
    this.productos.forEach((p) => { if (this.selectedIds.has(p.id)) p.activo = 1; });
    this.applyFilters();
  }

  bulkDesactivar(): void {
    const ids = Array.from(this.selectedIds);
    ids.forEach((id) => this.productosSvc.actualizar(id, { activo: 0 }).subscribe());
    this.productos.forEach((p) => { if (this.selectedIds.has(p.id)) p.activo = 0; });
    this.applyFilters();
  }

  bulkEliminar(): void {
    const ids = Array.from(this.selectedIds);
    ids.forEach((id) => this.productosSvc.eliminar(id).subscribe());
    this.productos = this.productos.filter((p) => !this.selectedIds.has(p.id));
    this.selectedIds.clear();
    this.applyFilters();
  }
}
