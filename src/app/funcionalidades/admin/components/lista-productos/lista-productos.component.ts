import { Component } from '@angular/core';
import { Router } from '@angular/router';

export interface Producto {
  id: number;
  nombre: string;
  precio: number;
}

@Component({
  selector: 'app-lista-productos',
  templateUrl: './lista-productos.component.html',
  styleUrls: ['./lista-productos.component.scss'],
  standalone: false
})
export class ListaProductosComponent {
  columnasTabla: string[] = ['nombre', 'precio', 'acciones'];
  productos: Producto[] = [
    { id: 1, nombre: 'Hamburguesa Clásica', precio: 8500 },
    { id: 2, nombre: 'Hamburguesa BBQ', precio: 9500 },
    { id: 3, nombre: 'Hamburguesa Vegetariana', precio: 8000 },
    { id: 4, nombre: 'Papas Fritas', precio: 3500 },
    { id: 5, nombre: 'Nuggets de Pollo', precio: 4500 }
  ];

  constructor(private router: Router) {}

  editarProducto(id: number): void {
    this.router.navigate(['/admin/editar', id]);
  }

  eliminarProducto(id: number): void {
    this.productos = this.productos.filter(producto => producto.id !== id);
    console.log(`Producto con ID ${id} eliminado`);
  }

  nuevoProducto(): void {
    this.router.navigate(['/admin/nuevo']);
  }
}
