import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MapaSalonApiService } from '../../../mapa-meses/services/mapa-salon-api.service';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatListModule, MatButtonModule],
  template: `
    <div class="contenedor-pedidos">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Comandera</mat-card-title>
          <mat-card-subtitle>Gestión de pedidos</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div *ngIf="pedidos().length === 0; else lista">
            <p>No hay pedidos abiertos.</p>
          </div>
          <ng-template #lista>
            <mat-list>
              <mat-list-item *ngFor="let p of pedidos()" (click)="irPedido(p.pedidoId)" style="cursor:pointer;">
                <div matListItemTitle>Pedido #{{ p.pedidoId }}</div>
                <div matListItemLine>Mesa {{ p.mesaId }} — {{ p.area }}</div>
              </mat-list-item>
            </mat-list>
          </ng-template>
        </mat-card-content>
        <mat-card-actions>
          <button mat-stroked-button color="primary" (click)="refrescar()">Refrescar</button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .contenedor-pedidos {
      padding: 20px;
    }
  `]
})
export class PedidosComponent implements OnInit, OnDestroy {
  constructor(private api: MapaSalonApiService, private router: Router) {}

  pedidos = signal<{ area: 'interior'|'exterior'; mesaId: string; pedidoId: number }[]>([]);
  private poll?: any;

  ngOnInit(): void {
    this.cargar();
    this.poll = setInterval(() => this.cargar(), 3000);
  }

  ngOnDestroy(): void {
    if (this.poll) clearInterval(this.poll);
  }

  refrescar() { this.cargar(); }

  private cargar() {
    // Traer estados de ambas áreas y quedarnos con ocupadas con pedidoId
    this.api.getEstadoMesas('interior').subscribe({
      next: (interior) => {
        this.api.getEstadoMesas('exterior').subscribe({
          next: (exterior) => {
            const it = (interior || []).filter(m => m.estado === 'ocupada' && m.pedidoId);
            const ex = (exterior || []).filter(m => m.estado === 'ocupada' && m.pedidoId);
            const lista = [
              ...it.map(m => ({ area: 'interior' as const, mesaId: m.mesaId, pedidoId: Number(m.pedidoId) })),
              ...ex.map(m => ({ area: 'exterior' as const, mesaId: m.mesaId, pedidoId: Number(m.pedidoId) })),
            ];
            this.pedidos.set(lista);
          }
        });
      }
    });
  }

  irPedido(id: number) {
    this.router.navigate(['/comandera/pedido', id]);
  }
}
