import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ChangeDetectorRef, NgZone, inject } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { Categoria, Producto, ProductosService } from '../../../../core/services/productos.service';
import { PedidoClienteService, PedidoClienteState } from '../../pedido-cliente.service';

@Component({
  selector: 'app-menu-cliente',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    RouterModule
  ],
  templateUrl: './menu-cliente.component.html',
  styleUrls: ['./menu-cliente.component.scss'],
})
export class MenuClienteComponent implements OnInit, OnDestroy {
  isLoading = true;
  categorias: Categoria[] = [];
  productos: Producto[] = [];
  pedidoState: PedidoClienteState = { items: {}, total: 0 };
  private stateSubscription!: Subscription;
  errorMessage: string | null = null;

  // Lightbox
  lightboxUrl: string | null = null;
  lightboxAlt = '';
  // Preferir inject() (Angular v16+)
  private productosService = inject(ProductosService);
  private pedidoClienteService = inject(PedidoClienteService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  private zone = inject(NgZone);

  ngOnInit(): void {
    this.productosService
      .getMenu()
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (data) => {
          this.zone.run(() => {
            this.categorias = data.categorias;
            this.productos = data.productos;
            this.errorMessage = null;
            // forzar actualización
            try { this.cdr.markForCheck(); this.cdr.detectChanges(); } catch { /* noop */ }
          });
        },
        error: (_err) => {
          this.errorMessage = 'No pudimos cargar el menú. Intenta de nuevo en unos minutos.';
        },
      });

    this.stateSubscription = this.pedidoClienteService.state$.subscribe(state => {
      this.pedidoState = state;
    });
  }

  ngOnDestroy(): void {
    if (this.stateSubscription) {
      this.stateSubscription.unsubscribe();
    }
  }

  getProductosPorCategoria(categoriaId: number): Producto[] {
    return this.productos.filter(p => Number(p.categoria_id) === Number(categoriaId));
  }

  agregarItem(producto: Producto): void {
    this.pedidoClienteService.agregarItem(producto);
  }

  quitarItem(producto: Producto): void {
    this.pedidoClienteService.quitarItem(producto.id);
  }

  cantidadEnCarrito(productoId: number): number {
    return this.pedidoState.items[productoId]?.cantidad || 0;
  }

  get total(): number {
    return this.pedidoState.total;
  }

  get cantidadTotalItems(): number {
    return Object.values(this.pedidoState.items).reduce((acc, item) => acc + item.cantidad, 0);
  }

  irAPagar(): void {
    this.router.navigate(['../pago'], { relativeTo: this.route });
  }

  // --- Imagen completa (lightbox) ---
  openImage(prod: Producto): void {
    const url = prod.imagen_url || 'https://via.placeholder.com/1200x900';
    this.lightboxUrl = url;
    this.lightboxAlt = prod.nombre || 'Imagen';
  }

  closeLightbox(): void {
    this.lightboxUrl = null;
    this.lightboxAlt = '';
  }

  stop(event: Event): void { event.stopPropagation(); }
}
