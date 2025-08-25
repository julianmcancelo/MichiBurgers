import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PedidoClienteService } from '../../pedido-cliente.service';
import { Categoria, Producto, ProductosService } from '../../../../core/services/productos.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-registro-cliente',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
  ],
  templateUrl: './registro-cliente.component.html',
  styleUrls: ['./registro-cliente.component.scss'],
})
export class RegistroClienteComponent implements OnInit, OnDestroy {
  form: FormGroup;
  // Estado rápido del menú
  isLoading = true;
  categorias: Categoria[] = [];
  productos: Producto[] = [];
  errorMessage: string | null = null;
  private stateSub?: Subscription;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private pedidoClienteService: PedidoClienteService,
    private productosService: ProductosService
  ) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      telefono: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    const area = this.route.snapshot.paramMap.get('area');
    const mesaId = this.route.snapshot.paramMap.get('mesaId');

    if (area && mesaId) {
      this.pedidoClienteService.setMesa(area, mesaId);
    } else {
      // Opcional: manejar el caso en que los parámetros no estén presentes
      // Por ejemplo, redirigir a una página de error o mostrar un mensaje.
      console.error('No se encontraron los parámetros de área y mesa.');
    }

    // Cargar menú para permitir armar pedido desde el registro
    this.productosService.getMenu().subscribe({
      next: (data) => {
        this.categorias = data.categorias;
        this.productos = data.productos;
        this.isLoading = false;
        this.errorMessage = null;
      },
      error: (err) => {
        console.error('[RegistroCliente] Error cargando menú', err);
        this.errorMessage = 'No pudimos cargar el menú ahora. Podés continuar y verlo en el próximo paso.';
        this.isLoading = false;
      },
    });

    // Mantener total/cantidades sincronizadas si se muestra el menú rápido
    this.stateSub = this.pedidoClienteService.state$.subscribe();
  }

  iniciarPedido(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { nombre, telefono } = this.form.value;
    this.pedidoClienteService.setCliente(nombre, telefono);
    const area = this.route.snapshot.paramMap.get('area');
    const mesaId = this.route.snapshot.paramMap.get('mesaId');
    console.debug('[RegistroCliente] iniciarPedido -> navegando a menu', { area, mesaId });
    this.router
      .navigate(['/pedido-qr', area, mesaId, 'menu'])
      .then((ok) => console.debug('[RegistroCliente] navegación a Menú', ok ? 'OK' : 'FALLÓ'))
      .catch((err) => console.error('[RegistroCliente] error navegando a Menú', err));
  }

  // Helpers menú rápido
  getProductosPorCategoria(categoriaId: number): Producto[] {
    return this.productos.filter((p) => p.categoria_id === categoriaId);
  }

  agregarItem(producto: Producto): void {
    this.pedidoClienteService.agregarItem(producto);
  }

  quitarItem(producto: Producto): void {
    this.pedidoClienteService.quitarItem(producto.id);
  }

  ngOnDestroy(): void {
    this.stateSub?.unsubscribe();
  }
}
