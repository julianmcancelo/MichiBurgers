import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ProductosService, ProductoDTO } from '../../services/productos.service';
import { MatDialog } from '@angular/material/dialog';
import { NuevoProductoDialogComponent } from '../nuevo-producto-dialog/nuevo-producto-dialog.component';

export interface Producto extends ProductoDTO {}

@Component({
  selector: 'app-lista-productos',
  templateUrl: './lista-productos.component.html',
  styleUrls: ['./lista-productos.component.scss'],
  standalone: false
})
export class ListaProductosComponent {
  columnasTabla: string[] = ['foto', 'nombre', 'precio', 'acciones'];
  productos: Producto[] = [];
  loading = true;
  error: string | null = null;

  constructor(private router: Router, private productosSvc: ProductosService, private dialog: MatDialog) {
    this.cargar();
  }

  cargar(): void {
    this.loading = true;
    this.error = null;
    this.productosSvc.listar().subscribe({
      next: (resp) => {
        this.productos = resp.productos.map(p => ({ ...p }));
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar los productos';
        this.loading = false;
      }
    });
  }

  editarProducto(id: number): void {
    this.router.navigate(['/admin/editar', id]);
  }

  eliminarProducto(id: number): void {
    this.productosSvc.eliminar(id).subscribe({
      next: () => {
        this.productos = this.productos.filter(producto => producto.id !== id);
      },
      error: () => {
        this.error = 'No se pudo eliminar el producto';
      }
    });
  }

  nuevoProducto(): void {
    const ref = this.dialog.open(NuevoProductoDialogComponent, {
      width: '520px',
      panelClass: 'tight-dialog',
      disableClose: true
    });
    ref.afterClosed().subscribe(res => {
      if (res?.ok) this.cargar();
    });
  }

  onImgError(ev: Event): void {
    const img = ev.target as HTMLImageElement | null;
    if (img && img.src !== '/favicon.ico') {
      img.src = '/favicon.ico';
    }
  }
}
