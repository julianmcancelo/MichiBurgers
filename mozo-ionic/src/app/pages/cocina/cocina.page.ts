import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, IonLabel, IonBadge, IonButton, IonButtons, IonIcon, IonRefresher, IonRefresherContent, IonSpinner, IonSegment, IonSegmentButton } from '@ionic/angular/standalone';
import { KitchenApi, PedidoCocina } from '../../core/api/kitchen-api';
import { addIcons } from 'ionicons';
import { refreshOutline, checkmarkDoneOutline, flameOutline } from 'ionicons/icons';

@Component({
  selector: 'app-cocina',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonList, IonItem, IonLabel, IonBadge, IonButton, IonButtons, IonIcon,
    IonRefresher, IonRefresherContent, IonSpinner,
    IonSegment, IonSegmentButton
  ],
  templateUrl: './cocina.page.html',
  styleUrls: ['./cocina.page.scss']
})
export class CocinaPage implements OnInit {
  loading = false;
  pedidos: PedidoCocina[] = [];
  filtro: 'todos' | 'pendiente' | 'preparando' | 'listo' = 'todos';
  private timer?: any;

  constructor(private api: KitchenApi) {
    addIcons({ refreshOutline, checkmarkDoneOutline, flameOutline });
  }

  ngOnInit() {
    this.cargar();
    // Auto-refresh cada 15s
    this.timer = setInterval(() => this.cargar(), 15000);
  }

  async cargar(event?: any) {
    this.loading = !event;
    this.api.listarPendientes().subscribe({
      next: (data) => {
        this.pedidos = data || [];
        if (event) event.target.complete();
        this.loading = false;
      },
      error: () => {
        if (event) event.target.complete();
        this.loading = false;
      }
    });
  }

  actualizar(itemId: number, estado: 'preparando' | 'listo') {
    this.api.actualizarEstado({ itemId, estado }).subscribe({
      next: () => this.cargar(),
      error: () => this.cargar()
    });
  }

  getPedidosFiltrados() {
    if (this.filtro === 'todos') return this.pedidos;
    return this.pedidos.map(p => ({
      ...p,
      items: p.items.filter(it => it.estado === this.filtro)
    })).filter(p => p.items.length > 0);
  }

  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
  }
}
