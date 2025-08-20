import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MapaSalonApiService } from '../../../mapa-meses/services/mapa-salon-api.service';

@Component({
  selector: 'app-pedido',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatCardModule, MatButtonModule, MatIconModule, MatListModule,
    MatSelectModule, MatFormFieldModule, MatInputModule,
  ],
  template: `
  <div class="pedido-wrap">
    <mat-card>
      <mat-card-header>
        <mat-card-title>Pedido #{{ pedido()?.pedido?.id || '-' }}</mat-card-title>
        <mat-card-subtitle>Mesa {{ pedido()?.pedido?.mesa_id }} – {{ pedido()?.pedido?.area }}</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        <div class="contenido">
          <div class="izq">
            <h3>Ítems</h3>
            <mat-list>
              <mat-list-item *ngFor="let it of (pedido()?.items || [])">
                <div matListItemTitle>{{ it.nombre }} x{{ it.cantidad }}</div>
                <div matListItemLine>
                  $ {{ it.precio_unit | number:'1.2-2' }} c/u — Subtotal $ {{ it.subtotal | number:'1.2-2' }}
                </div>
              </mat-list-item>
            </mat-list>
            <div class="total">
              Total: <strong>$ {{ pedido()?.pedido?.total | number:'1.2-2' }}</strong>
            </div>
          </div>
          <div class="der">
            <h3>Agregar producto</h3>
            <mat-form-field appearance="outline" style="width:100%">
              <mat-label>Producto</mat-label>
              <mat-select [(ngModel)]="productoSelId">
                <mat-optgroup *ngFor="let c of categorias()" [label]="c.nombre">
                  <mat-option *ngFor="let p of productosPorCat(c.id)" [value]="p.id">
                    {{ p.nombre }} $ {{ p.precio | number:'1.2-2' }}
                  </mat-option>
                </mat-optgroup>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline" style="width:100%">
              <mat-label>Cantidad</mat-label>
              <input matInput type="number" min="1" [(ngModel)]="cantidad" />
            </mat-form-field>
            <button mat-raised-button color="primary" (click)="agregar()" [disabled]="!productoSelId">Agregar</button>
            <hr>
            <h3>Pagar</h3>
            <div class="pagar">
              <button mat-stroked-button color="accent" (click)="pagar('efectivo')"><mat-icon>attach_money</mat-icon> Efectivo</button>
              <button mat-stroked-button color="accent" (click)="pagar('tarjeta')"><mat-icon>credit_card</mat-icon> Tarjeta</button>
              <button mat-stroked-button color="accent" (click)="pagar('qr')"><mat-icon>qr_code</mat-icon> QR</button>
            </div>
          </div>
        </div>
      </mat-card-content>
      <mat-card-actions>
        <button mat-button (click)="volver()"><mat-icon>arrow_back</mat-icon> Volver</button>
      </mat-card-actions>
    </mat-card>
  </div>
  `,
  styles: [`
    .pedido-wrap { padding: 16px; }
    .contenido { display: grid; grid-template-columns: 1fr 320px; gap: 16px; }
    .total { margin-top: 8px; font-size: 18px; }
    .pagar { display:flex; gap:8px; flex-wrap:wrap; }
    @media (max-width: 900px) { .contenido { grid-template-columns: 1fr; } }
  `]
})
export class PedidoComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(MapaSalonApiService);
  private router = inject(Router);

  pedido = signal<{ pedido: any; items: any[] } | null>(null);
  categorias = signal<any[]>([]);
  productos = signal<any[]>([]);

  productoSelId: number | null = null;
  cantidad = 1;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id')) || 0;
    if (id > 0) this.cargar(id);
    this.api.listarProductos().subscribe({
      next: (res) => {
        this.categorias.set(res.categorias || []);
        this.productos.set(res.productos || []);
      },
    });
  }

  productosPorCat(catId: number) {
    return (this.productos() || []).filter(p => p.categoria_id === catId);
  }

  cargar(id: number) {
    this.api.pedidoDetalle(id).subscribe({
      next: (res) => this.pedido.set(res),
    });
  }

  agregar() {
    const ped = this.pedido();
    if (!ped || !this.productoSelId) return;
    this.api.agregarItem(ped.pedido.id, this.productoSelId, this.cantidad || 1).subscribe({
      next: () => this.cargar(ped.pedido.id)
    });
  }

  pagar(metodo: 'efectivo'|'tarjeta'|'qr'|'mixto') {
    const ped = this.pedido();
    if (!ped) return;
    this.api.pagarPedido(ped.pedido.id, metodo).subscribe({
      next: () => this.router.navigate(['/comandera/pedidos'])
    });
  }

  volver() { this.router.navigate(['/comandera/pedidos']); }
}
