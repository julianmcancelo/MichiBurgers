import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';

import { LayoutPrincipalComponent } from './components/layout-principal/layout-principal.component';
import { CurrencyFormatPipe } from './pipes/currency-format.pipe';
import { TimeAgoPipe } from './pipes/time-ago.pipe';
import { EstadoMesaPipe } from './pipes/estado-mesa.pipe';
import { HighlightDirective } from './directives/highlight.directive';
import { LoadingDirective } from './directives/loading.directive';
import { RoleAccessDirective } from './directives/role-access.directive';

@NgModule({
  declarations: [LayoutPrincipalComponent],
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatDialogModule,
    MatTooltipModule,
    // Pipes y Directivas Standalone
    CurrencyFormatPipe,
    TimeAgoPipe,
    EstadoMesaPipe,
    HighlightDirective,
    LoadingDirective,
    RoleAccessDirective,
  ],
  exports: [
    LayoutPrincipalComponent,
    // Exportar pipes y directivas para uso en otros módulos
    CurrencyFormatPipe,
    TimeAgoPipe,
    EstadoMesaPipe,
    HighlightDirective,
    LoadingDirective,
    RoleAccessDirective,
  ],
})
export class SharedModule {}
