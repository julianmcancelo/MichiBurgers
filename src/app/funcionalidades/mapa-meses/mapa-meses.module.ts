import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';

import { EditarMesComponent } from './pages/editar-mes/editar-mes.component';
import { EstadoMesasComponent } from './pages/estado-mesas/estado-mesas.component';
import { ListaMesesComponent } from './pages/lista-meses/lista-meses.component';
import { MapaSalonComponent } from './pages/mapa-salon/mapa-salon.component';
import { PedidoComponent } from '../comandera/components/pedido/pedido.component';

@NgModule({
  declarations: [ListaMesesComponent, EditarMesComponent, MapaSalonComponent, EstadoMesasComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDialogModule,
    DragDropModule,
    MatCheckboxModule,
    MatButtonToggleModule,
    HttpClientModule,
    RouterModule.forChild([
      { path: '', component: ListaMesesComponent },
      { path: 'nuevo', component: EditarMesComponent },
      { path: 'editar/:id', component: EditarMesComponent },
      { path: 'salon', component: MapaSalonComponent },
      { path: 'estado', component: EstadoMesasComponent },
    ]),
    // Standalone component used inside templates
    PedidoComponent,
  ],
})
export class MapaMesesModule {}
