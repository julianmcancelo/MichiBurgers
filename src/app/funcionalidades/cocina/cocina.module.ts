import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', redirectTo: 'preparacion', pathMatch: 'full' },
      {
        path: 'preparacion',
        loadComponent: () =>
          import('./components/preparacion/preparacion.component').then(
            (c) => c.PreparacionComponent,
          ),
      },
    ]),
  ],
})
export class CocinaModule {}
