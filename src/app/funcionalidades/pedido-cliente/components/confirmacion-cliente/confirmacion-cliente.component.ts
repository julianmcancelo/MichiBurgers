import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { PedidoClienteService, PedidoClienteState } from '../../pedido-cliente.service';
import { Subscription } from 'rxjs';
import { PedidoApiService, MesaEstadoItem } from '../../pedido-api.service';

@Component({
  selector: 'app-confirmacion-cliente',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './confirmacion-cliente.component.html',
  styleUrls: ['./confirmacion-cliente.component.scss'],
})
export class ConfirmacionClienteComponent implements OnInit, OnDestroy {
  pedidoState: PedidoClienteState = { items: {}, total: 0 };
  private sub?: Subscription;
  mesaEstado?: MesaEstadoItem;
  private statusInterval: any;

  // Preferir inject() (Angular >=16)
  private pedidoClienteService = inject(PedidoClienteService);
  private pedidoApiService = inject(PedidoApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    // Mostrar los datos capturados en la confirmación.
    this.sub = this.pedidoClienteService.state$.subscribe(state => {
      this.pedidoState = state;
    });

    // Si es transferencia, hacer polling de estado de mesa para detectar aprobación
    this.startMesaStatusPollingIfNeeded();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    if (this.statusInterval) {
      clearInterval(this.statusInterval);
    }
  }

  private startMesaStatusPollingIfNeeded(): void {
    if (this.pedidoState?.pagoMetodo !== 'transferencia') return;
    if (!this.pedidoState?.area || !this.pedidoState?.mesaId) return;

    const area = this.pedidoState.area as 'interior' | 'exterior';
    const mesaId = String(this.pedidoState.mesaId);

    const fetchOnce = () => {
      this.pedidoApiService.getEstadoMesas(area).subscribe({
        next: (resp) => {
          const found = resp.mesas.find((m) => String(m.mesaId) === mesaId);
          this.mesaEstado = found;
        },
        error: () => {
          // no bloquear UI
        },
      });
    };

    fetchOnce();
    this.statusInterval = setInterval(fetchOnce, 5000);
  }

  nuevoPedido(): void {
    // Ahora sí, limpiar el estado al iniciar un nuevo pedido
    this.pedidoClienteService.resetState();
    this.router.navigate(['/']); // O a la ruta inicial que corresponda
  }
}
