import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Categoria, Producto, ProductosService } from '../../../../core/services/productos.service';
import { PedidoClienteService } from '../../pedido-cliente.service';
import { Observable, Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { PedidoClienteState } from '../../pedido-cliente.service';

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
export class MenuClienteComponent implements OnInit {
  isLoading = true;
  categorias: Categoria[] = [];
  productos: Producto[] = [];
  pedidoState: PedidoClienteState = { items: {}, total: 0 };
  private stateSubscription!: Subscription;
  errorMessage: string | null = null;

  constructor(
    private productosService: ProductosService,
    private pedidoClienteService: PedidoClienteService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {}

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
            try { this.cdr.markForCheck(); this.cdr.detectChanges(); } catch {}
            console.log('[MenuCliente] menu cargado', {
              categorias: this.categorias.length,
              productos: this.productos.length,
            });
          });
        },
        error: (err) => {
          console.error('[MenuCliente] Error cargando menú', err);
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
}
