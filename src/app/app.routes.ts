import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./funcionalidades/funcionalidades.module').then(m => m.FuncionalidadesModule)
  },
  {
    path: '**',
    redirectTo: '/auth/login'
  }
];
