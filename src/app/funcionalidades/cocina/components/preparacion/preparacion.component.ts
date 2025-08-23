import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-preparacion',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <div class="contenedor-cocina">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Cocina</mat-card-title>
          <mat-card-subtitle>Preparación de pedidos</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <p>Módulo de cocina en desarrollo...</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .contenedor-cocina {
        padding: 20px;
      }
    `,
  ],
})
export class PreparacionComponent {}
