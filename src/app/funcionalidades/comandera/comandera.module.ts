import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', redirectTo: 'pedidos', pathMatch: 'full' },
      {
        path: 'pedidos',
        loadComponent: () =>
          import('./components/pedidos/pedidos.component').then((c) => c.PedidosComponent),
      },
      {
        path: 'pedido/:id',
        loadComponent: () =>
          import('./components/pedido/pedido.component').then((c) => c.PedidoComponent),
      },
    ]),
  ],
})
export class ComanderaModule {}
