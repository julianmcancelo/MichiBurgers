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
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { ListaProductosComponent } from './components/lista-productos/lista-productos.component';
import { FormularioProductoComponent } from './components/formulario-producto/formulario-producto.component';
import { RegistroUsuarioComponent } from './components/registro-usuario/registro-usuario.component';

@NgModule({
  declarations: [
    ListaProductosComponent,
    FormularioProductoComponent
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
    HttpClientModule,
    RegistroUsuarioComponent,
    RouterModule.forChild([
      { path: '', component: ListaProductosComponent },
      { path: 'nuevo', component: FormularioProductoComponent },
      { path: 'editar/:id', component: FormularioProductoComponent },
      { path: 'usuarios/registrar', component: RegistroUsuarioComponent }
    ])
  ]
})
export class AdminModule { }
