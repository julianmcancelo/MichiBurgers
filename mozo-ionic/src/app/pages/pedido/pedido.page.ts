import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MapaSalonApi } from '../../core/api/mapa-salon-api';

@Component({
  selector: 'app-pedido',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: './pedido.page.html'
})
export class PedidoPage implements OnInit {
  pedidoId!: number;
  data?: { pedido: any; items: any[] };
  loading = false;

  constructor(private route: ActivatedRoute, private api: MapaSalonApi) {}

  ngOnInit(): void {
    this.pedidoId = Number(this.route.snapshot.paramMap.get('id'));
    this.load();
  }

  load() {
    this.loading = true;
    this.api.getPedido(this.pedidoId).subscribe({
      next: (res) => {
        this.data = res;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  get total(): number {
    const items = this.data?.items ?? [];
    return items.reduce((acc, it: any) => acc + ((Number(it?.cantidad) || 0) * (Number(it?.precio) || 0)), 0);
  }
}
