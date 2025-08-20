import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { authGuard } from './auth/auth.guard';
import { InicioComponent } from './inicio/inicio.component';
import { MatButtonModule } from '@angular/material/button';
import { NotFoundComponent } from './not-found/not-found.component';

@NgModule({
  declarations: [
    InicioComponent,
    NotFoundComponent
  ],
  imports: [
    CommonModule,
    MatButtonModule,
    RouterModule.forChild([
      {
        path: '',
        component: InicioComponent,
        canActivate: [authGuard]
      },
      {
        path: 'mapa-meses',
        loadChildren: () => import('./mapa-meses/mapa-meses.module').then(m => m.MapaMesesModule),
        canActivate: [authGuard],
        data: { roles: ['admin', 'mozo'] }
      },
      {
        path: 'auth',
        loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
      },
      {
        path: 'admin',
        loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
        canActivate: [authGuard],
        data: { roles: ['admin'] }
      },
      {
        path: 'comandera',
        loadChildren: () => import('./comandera/comandera.module').then(m => m.ComanderaModule),
        canActivate: [authGuard],
        data: { roles: ['admin', 'mozo', 'caja'] }
      },
      {
        path: 'cocina',
        loadChildren: () => import('./cocina/cocina.module').then(m => m.CocinaModule),
        canActivate: [authGuard],
        data: { roles: ['admin', 'cocina'] }
      },
      {
        path: '**',
        component: NotFoundComponent
      }
    ])
  ]
})
export class FuncionalidadesModule { }
