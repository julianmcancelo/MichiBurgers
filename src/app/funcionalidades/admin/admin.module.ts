import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';

import { authGuard } from '../auth/auth.guard';
import { FormularioProductoComponent } from './components/formulario-producto/formulario-producto.component';
import { ListaProductosComponent } from './components/lista-productos/lista-productos.component';
import { NuevoProductoDialogComponent } from './components/nuevo-producto-dialog/nuevo-producto-dialog.component';
import { QrGeneratorComponent } from './components/qr-generator/qr-generator.component';
import { RegistroUsuarioComponent } from './components/registro-usuario/registro-usuario.component';
import { RevisarTransferenciasComponent } from './components/revisar-transferencias/revisar-transferencias.component';
import { DashboardAdminComponent } from './components/dashboard-admin/dashboard-admin.component';

@NgModule({
  declarations: [ListaProductosComponent, FormularioProductoComponent, DashboardAdminComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatSnackBarModule,
    MatDialogModule,
    HttpClientModule,
    RouterModule.forChild([
      {
        path: '',
        component: DashboardAdminComponent,
        canActivate: [authGuard],
        data: { roles: ['admin'] },
      },
      {
        path: 'productos',
        component: ListaProductosComponent,
        canActivate: [authGuard],
        data: { roles: ['admin'] },
      },
      {
        path: 'nuevo',
        component: FormularioProductoComponent,
        canActivate: [authGuard],
        data: { roles: ['admin'] },
      },
      {
        path: 'editar/:id',
        component: FormularioProductoComponent,
        canActivate: [authGuard],
        data: { roles: ['admin'] },
      },
      {
        path: 'usuarios/registrar',
        component: RegistroUsuarioComponent,
        canActivate: [authGuard],
        data: { roles: ['admin'] },
      },
      {
        path: 'qr',
        component: QrGeneratorComponent,
        canActivate: [authGuard],
        data: { roles: ['admin'] },
      },
      {
        path: 'pagos/transferencias',
        component: RevisarTransferenciasComponent,
        canActivate: [authGuard],
        data: { roles: ['admin'] },
      },
    ]),
  ],
})
export class AdminModule {}
