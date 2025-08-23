import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Angular Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';

// Componentes y Pipes/Directivas
import { DemoComponent } from './demo.component';
import { CurrencyFormatPipe } from '../../compartido/pipes/currency-format.pipe';
import { TimeAgoPipe } from '../../compartido/pipes/time-ago.pipe';
import { EstadoMesaPipe } from '../../compartido/pipes/estado-mesa.pipe';
import { HighlightDirective } from '../../compartido/directives/highlight.directive';
import { LoadingDirective } from '../../compartido/directives/loading.directive';
import { RoleAccessDirective } from '../../compartido/directives/role-access.directive';

@NgModule({
  declarations: [
    DemoComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    
    // Angular Material
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatTabsModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MatBadgeModule,
    
    // Pipes y Directivas Standalone
    CurrencyFormatPipe,
    TimeAgoPipe,
    EstadoMesaPipe,
    HighlightDirective,
    LoadingDirective,
    RoleAccessDirective,
    
    // Routing
    RouterModule.forChild([
      {
        path: '',
        component: DemoComponent
      }
    ])
  ]
})
export class DemoModule { }
