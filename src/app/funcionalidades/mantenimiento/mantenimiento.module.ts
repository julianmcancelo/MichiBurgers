import { NgModule, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { LoginMasterComponent } from './pages/login-master/login-master.component';
import { PanelMantenimientoComponent } from './pages/panel-mantenimiento/panel-mantenimiento.component';
import { MasterAuthService } from './services/master-auth.service';

// Guard funcional inline (evita problema de resolución de imports mientras tanto)
const masterGuard = () => {
  const platformId = inject(PLATFORM_ID);
  const isBrowser = isPlatformBrowser(platformId);
  // En SSR permitir y delegar la validación al cliente para evitar redirección prematura
  if (!isBrowser) return true;
  const auth = inject(MasterAuthService);
  const router = inject(Router);
  if (auth.isAuthenticated) return true;
  router.navigate(['/mantenimiento/ingresar']);
  return false;
};

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'ingresar' },
  { path: 'ingresar', component: LoginMasterComponent },
  { path: 'panel', component: PanelMantenimientoComponent, canActivate: [masterGuard] },
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    LoginMasterComponent,
    PanelMantenimientoComponent,
    RouterModule.forChild(routes),
  ],
})
export class MantenimientoModule {}
