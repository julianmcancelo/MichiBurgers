import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { PedidoClienteService, PedidoClienteState } from '../../pedido-cliente.service';
import { PedidoApiService } from '../../pedido-api.service';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-pago-cliente',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatListModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    RouterModule,
  ],
  templateUrl: './pago-cliente.component.html',
  styleUrls: ['./pago-cliente.component.scss'],
})
export class PagoClienteComponent implements OnInit, OnDestroy {
  pedidoState: PedidoClienteState = { items: {}, total: 0 };
  isLoading = false;
  errorMessage: string | null = null;

  private stateSubscription!: Subscription;

  constructor(
    private pedidoClienteService: PedidoClienteService,
    private pedidoApiService: PedidoApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.stateSubscription = this.pedidoClienteService.state$.subscribe(state => {
      this.pedidoState = state;
    });
  }

  ngOnDestroy(): void {
    if (this.stateSubscription) {
      this.stateSubscription.unsubscribe();
    }
  }

  confirmarPedido(): void {
    this.isLoading = true;
    this.errorMessage = null;

    const mesaId = this.route.snapshot.parent?.paramMap.get('mesa_id');
    if (!mesaId || !this.pedidoState.cliente) {
      this.errorMessage = 'Faltan datos para crear el pedido (mesa o cliente).';
      this.isLoading = false;
      return;
    }

    const payload = {
      nombre_cliente: this.pedidoState.cliente.nombre,
      telefono_cliente: this.pedidoState.cliente.telefono,
      mesa_id: +mesaId,
      items: Object.entries(this.pedidoState.items).map(([id, item]) => ({
        id: +id,
        cantidad: item.cantidad,
      })),
      total: this.pedidoState.total,
    };

    this.pedidoApiService.crearPedido(payload).subscribe({
      next: (res) => {
        // Simulación de pago exitoso inmediato
        this.pedidoApiService.confirmarPago({ pedido_cliente_id: res.id }).subscribe({
          next: () => {
            this.isLoading = false;
            // Navegar a la página de éxito
            this.router.navigate(['../confirmacion'], { relativeTo: this.route });
          },
          error: (err) => {
            this.errorMessage = 'Hubo un error al confirmar el pago. Por favor, intenta de nuevo.';
            this.isLoading = false;
          }
        });
      },
      error: (err) => {
        this.errorMessage = 'Hubo un error al crear tu pedido. Por favor, intenta de nuevo.';
        this.isLoading = false;
      }
    });
  }
}
