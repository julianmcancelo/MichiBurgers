import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/auth/auth.guard';
import { AdminGuard } from './core/auth/admin.guard';
import { KitchenGuard } from './core/auth/kitchen.guard';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'mesas',
    loadChildren: () => import('./pages/mesas/mesas.module').then( m => m.MesasPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'pedido/:id',
    loadComponent: () => import('./pages/pedido/pedido.page').then(m => m.PedidoPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin-config/admin-config.page').then(m => m.AdminConfigPage),
    canActivate: [AuthGuard, AdminGuard]
  },
  {
    path: 'cocina',
    loadComponent: () => import('./pages/cocina/cocina.page').then(m => m.CocinaPage),
    canActivate: [AuthGuard, KitchenGuard]
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage)
  },
  { path: '**', redirectTo: 'login' }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
