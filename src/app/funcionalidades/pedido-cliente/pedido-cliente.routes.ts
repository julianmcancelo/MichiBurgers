import { Routes } from '@angular/router';
import { RegistroClienteComponent } from './components/registro-cliente/registro-cliente.component';
import { MenuClienteComponent } from './components/menu-cliente/menu-cliente.component';
import { PagoClienteComponent } from './components/pago-cliente/pago-cliente.component';
import { ConfirmacionClienteComponent } from './components/confirmacion-cliente/confirmacion-cliente.component';

export const PEDIDO_CLIENTE_ROUTES: Routes = [
  {
    path: '',
    component: RegistroClienteComponent,
  },
  {
    path: 'menu',
    component: MenuClienteComponent,
  },
  {
    path: 'pago',
    component: PagoClienteComponent,
  },
  {
    path: 'confirmacion',
    component: ConfirmacionClienteComponent,
  },
];
