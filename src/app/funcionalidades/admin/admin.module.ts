import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { RouterModule } from '@angular/router';
import { authGuard } from '../auth/auth.guard';
import { HttpClientModule } from '@angular/common/http';

import { ListaProductosComponent } from './components/lista-productos/lista-productos.component';
import { FormularioProductoComponent } from './components/formulario-producto/formulario-producto.component';
import { RegistroUsuarioComponent } from './components/registro-usuario/registro-usuario.component';
import { NuevoProductoDialogComponent } from './components/nuevo-producto-dialog/nuevo-producto-dialog.component';
import { QrGeneratorComponent } from './components/qr-generator/qr-generator.component';

@NgModule({
  declarations: [
    ListaProductosComponent,
    FormularioProductoComponent,
    QrGeneratorComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatDialogModule,
    MatCheckboxModule,
    HttpClientModule,
    RegistroUsuarioComponent,
    NuevoProductoDialogComponent,
    RouterModule.forChild([
      { path: '', component: ListaProductosComponent, canActivate: [authGuard], data: { roles: ['admin'] } },
      { path: 'nuevo', component: FormularioProductoComponent, canActivate: [authGuard], data: { roles: ['admin'] } },
      { path: 'editar/:id', component: FormularioProductoComponent, canActivate: [authGuard], data: { roles: ['admin'] } },
      { path: 'usuarios/registrar', component: RegistroUsuarioComponent, canActivate: [authGuard], data: { roles: ['admin'] } },
      { path: 'qr', component: QrGeneratorComponent, canActivate: [authGuard], data: { roles: ['admin'] } }
    ])
  ]
})
export class AdminModule { }
