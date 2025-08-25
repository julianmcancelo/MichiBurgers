import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { PedidoClienteService, PedidoClienteState } from '../../pedido-cliente.service';
import { PedidoApiService } from '../../pedido-api.service';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-pago-cliente',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatListModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    RouterModule,
    FormsModule,
  ],
  templateUrl: './pago-cliente.component.html',
  styleUrls: ['./pago-cliente.component.scss'],
})
export class PagoClienteComponent implements OnInit, OnDestroy {
  pedidoState: PedidoClienteState = { items: {}, total: 0 };
  isLoading = false;
  errorMessage: string | null = null;

  // UI de prueba para métodos de pago
  selectedMetodo: 'tarjeta' | 'mercado_pago' | 'transferencia' | '' = '';
  cardForm = {
    nombre: '',
    numero: '',
    vencimiento: '',
    cvv: '',
  };
  transferenciaDatos = {
    alias: 'MICHIBURGERS.PEDIDOS',
    cbu: '0000003100000001234567',
    titular: 'Michi Burgers SRL',
    banco: 'Banco Ficticio S.A.',
  };
  transferenciaComprobanteBase64: string | null = null;
  transferenciaComprobanteNombre: string | null = null;

  private stateSubscription!: Subscription;

  constructor(
    private pedidoClienteService: PedidoClienteService,
    private pedidoApiService: PedidoApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.stateSubscription = this.pedidoClienteService.state$.subscribe(state => {
      this.pedidoState = state;
    });
  }

  ngOnDestroy(): void {
    if (this.stateSubscription) {
      this.stateSubscription.unsubscribe();
    }
  }

  onTransferenciaFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (!file) { this.transferenciaComprobanteBase64 = null; this.transferenciaComprobanteNombre = null; return; }
    this.transferenciaComprobanteNombre = file.name;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // result may be a data URL. Keep full data URL for easier backend parsing.
      this.transferenciaComprobanteBase64 = result;
    };
    reader.readAsDataURL(file);
  }

  confirmarPedido(): void {
    this.isLoading = true;
    this.errorMessage = null;

    // Validación mínima: elegir un método. Para tarjeta, verificar campos básicos.
    if (!this.selectedMetodo) {
      this.errorMessage = 'Elegí un método de pago para continuar.';
      this.isLoading = false;
      return;
    }
    if (this.selectedMetodo === 'tarjeta') {
      const { nombre, numero, vencimiento, cvv } = this.cardForm;
      const ok = nombre.trim().length > 2 && numero.replace(/\s+/g, '').length >= 16 && /\d{2}\/\d{2}/.test(vencimiento) && cvv.trim().length >= 3;
      if (!ok) {
        this.errorMessage = 'Completá los datos de la tarjeta (solo de muestra).';
        this.isLoading = false;
        return;
      }
    } else if (this.selectedMetodo === 'transferencia') {
      if (!this.transferenciaComprobanteBase64) {
        this.errorMessage = 'Subí el comprobante de la transferencia para continuar.';
        this.isLoading = false;
        return;
      }
    }

    // Los parámetros ':area/:mesaId' están dos niveles arriba del hijo 'pago'
    const mesaId = this.route.parent?.parent?.snapshot.paramMap.get('mesaId');
    const area = this.route.parent?.parent?.snapshot.paramMap.get('area');
    if (!mesaId || !area || !this.pedidoState.cliente) {
      this.errorMessage = 'Faltan datos para crear el pedido (mesa o cliente).';
      this.isLoading = false;
      return;
    }

    const itemsMap: { [id: number]: number } = {};
    Object.entries(this.pedidoState.items).forEach(([id, item]: any) => {
      itemsMap[+id] = item.cantidad;
    });

    const payload = {
      area: area as any,
      mesa_id: mesaId,
      cliente_nombre: this.pedidoState.cliente?.nombre,
      cliente_telefono: this.pedidoState.cliente?.telefono,
      items: itemsMap,
    };

    this.pedidoApiService.crearPedido(payload).subscribe({
      next: (res) => {
        const pedidoId = (res as any)?.id || (res as any)?.pedido_id;
        const detalles = this.selectedMetodo === 'tarjeta'
          ? { nombre: this.cardForm.nombre, ult4: this.cardForm.numero.slice(-4), vencimiento: this.cardForm.vencimiento }
          : this.selectedMetodo === 'mercado_pago'
          ? { tipo: 'qr_demo' }
          : this.selectedMetodo === 'transferencia'
          ? { ...this.transferenciaDatos, comprobante: { nombre: this.transferenciaComprobanteNombre, dataUrl: this.transferenciaComprobanteBase64 } }
          : null;
        const referencia = this.selectedMetodo === 'tarjeta'
          ? this.cardForm.numero.slice(-4)
          : this.selectedMetodo === 'transferencia'
          ? this.transferenciaDatos.cbu
          : undefined;

        // Simulación de pago: confirmamos con método y detalles para que el backend lo almacene
        this.pedidoApiService.confirmarPago({
          pedido_cliente_id: pedidoId,
          metodo: this.selectedMetodo as any,
          detalles,
          referencia,
        }).subscribe({
          next: () => {
            this.isLoading = false;
            this.router.navigate(['../confirmacion'], { relativeTo: this.route });
          },
          error: () => {
            this.errorMessage = 'Hubo un error al confirmar el pago. Por favor, intenta de nuevo.';
            this.isLoading = false;
          }
        });
      },
      error: (err) => {
        this.errorMessage = 'Hubo un error al crear tu pedido. Por favor, intenta de nuevo.';
        this.isLoading = false;
      }
    });
  }
}
