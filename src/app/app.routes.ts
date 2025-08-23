// Rutas principales de la aplicación.
// - Carga diferida del módulo de funcionalidades (mejor tiempo de inicio).
// - Redirección wildcard a la pantalla de login para rutas no encontradas.
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./funcionalidades/funcionalidades.module').then((m) => m.FuncionalidadesModule),
  },
  {
    path: '**',
    redirectTo: '/auth/login',
  },
];
