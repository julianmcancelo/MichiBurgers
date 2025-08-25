import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { PedidoClienteService, PedidoClienteState } from '../../pedido-cliente.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-confirmacion-cliente',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './confirmacion-cliente.component.html',
  styleUrls: ['./confirmacion-cliente.component.scss'],
})
export class ConfirmacionClienteComponent implements OnInit {
  pedidoState: PedidoClienteState = { items: {}, total: 0 };
  private sub?: Subscription;

  constructor(
    private pedidoClienteService: PedidoClienteService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Mostrar los datos capturados en la confirmación.
    this.sub = this.pedidoClienteService.state$.subscribe(state => {
      this.pedidoState = state;
    });
  }

  nuevoPedido(): void {
    // Ahora sí, limpiar el estado al iniciar un nuevo pedido
    this.pedidoClienteService.resetState();
    this.sub?.unsubscribe();
    this.router.navigate(['/']); // O a la ruta inicial que corresponda
  }
}
