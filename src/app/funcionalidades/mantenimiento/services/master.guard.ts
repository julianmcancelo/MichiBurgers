import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { MasterAuthService } from './master-auth.service';

export const masterGuard: CanActivateFn = () => {
  const auth = inject(MasterAuthService);
  const router = inject(Router);
  if (auth.isAuthenticated) return true;
  router.navigate(['/mantenimiento/ingresar']);
  return false;
};
