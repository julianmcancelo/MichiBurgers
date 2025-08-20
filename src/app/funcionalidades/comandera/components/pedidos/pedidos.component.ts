import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <div class="contenedor-pedidos">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Comandera</mat-card-title>
          <mat-card-subtitle>Gestión de pedidos</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <p>Módulo de comandera en desarrollo...</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .contenedor-pedidos {
      padding: 20px;
    }
  `]
})
export class PedidosComponent { }
