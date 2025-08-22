import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { HttpClientModule } from '@angular/common/http';

import { ListaMesesComponent } from './pages/lista-meses/lista-meses.component';
import { EditarMesComponent } from './pages/editar-mes/editar-mes.component';
import { MapaSalonComponent } from './pages/mapa-salon/mapa-salon.component';
import { EstadoMesasComponent } from './pages/estado-mesas/estado-mesas.component';

@NgModule({
  declarations: [
    ListaMesesComponent,
    EditarMesComponent,
    MapaSalonComponent,
    EstadoMesasComponent
  ],
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
    DragDropModule,
    MatCheckboxModule,
    MatButtonToggleModule,
    HttpClientModule,
    RouterModule.forChild([
      { path: '', component: ListaMesesComponent },
      { path: 'nuevo', component: EditarMesComponent },
      { path: 'editar/:id', component: EditarMesComponent },
      { path: 'salon', component: MapaSalonComponent },
      { path: 'estado', component: EstadoMesasComponent }
    ])
  ]
})
export class MapaMesesModule { }
