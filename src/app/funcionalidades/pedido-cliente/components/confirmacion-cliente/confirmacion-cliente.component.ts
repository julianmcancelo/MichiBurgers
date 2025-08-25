import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { PedidoClienteService } from '../../pedido-cliente.service';

@Component({
  selector: 'app-confirmacion-cliente',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './confirmacion-cliente.component.html',
  styleUrls: ['./confirmacion-cliente.component.scss'],
})
export class ConfirmacionClienteComponent implements OnInit {
  constructor(
    private pedidoClienteService: PedidoClienteService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.pedidoClienteService.resetState();
  }

  nuevoPedido(): void {
    this.router.navigate(['/']); // O a la ruta inicial que corresponda
  }
}
