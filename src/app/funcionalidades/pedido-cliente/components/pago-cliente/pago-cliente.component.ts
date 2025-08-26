import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';

import { Subscription } from 'rxjs';

import { PedidoApiService, MesaEstadoItem } from '../../pedido-api.service';
import { PedidoClienteService, PedidoClienteState } from '../../pedido-cliente.service';

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
  mesaEstado?: MesaEstadoItem;
  private statusInterval: any;

  private stateSubscription!: Subscription;

  // Preferir inject() (Angular 16+)
  private pedidoClienteService = inject(PedidoClienteService);
  private pedidoApiService = inject(PedidoApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  ngOnInit(): void {
    this.stateSubscription = this.pedidoClienteService.state$.subscribe(state => {
      this.pedidoState = state;
    });

    // Si el estado no tiene mesa/área, intentar hidratar desde los params actuales
    const mesaIdParam = this.route.snapshot.paramMap.get('mesaId')
      || this.route.parent?.snapshot.paramMap.get('mesaId')
      || this.route.parent?.parent?.snapshot.paramMap.get('mesaId');
    const areaParam = this.route.snapshot.paramMap.get('area')
      || this.route.parent?.snapshot.paramMap.get('area')
      || this.route.parent?.parent?.snapshot.paramMap.get('area');
    if ((!this.pedidoState.mesaId || !this.pedidoState.area) && areaParam && mesaIdParam) {
      this.pedidoClienteService.setMesa(areaParam, mesaIdParam);
    }

    // Comenzar a consultar estado de mesa cada 5s
    this.startMesaStatusPolling();
  }

  ngOnDestroy(): void {
    if (this.stateSubscription) {
      this.stateSubscription.unsubscribe();
    }
    if (this.statusInterval) {
      globalThis.clearInterval(this.statusInterval);
    }
  }

  private startMesaStatusPolling(): void {
    if (!this.pedidoState?.area || !this.pedidoState?.mesaId) {
      return;
    }
    const area = this.pedidoState.area as 'interior' | 'exterior';
    const mesaId = String(this.pedidoState.mesaId);

    const fetchOnce = () => {
      this.pedidoApiService.getEstadoMesas(area).subscribe({
        next: (resp) => {
          const found = resp.mesas.find((m) => String(m.mesaId) === mesaId);
          this.mesaEstado = found;
        },
        error: () => {
          // silencio: no bloquear UI por errores intermitentes
        },
      });
    };

    // primera carga inmediata
    fetchOnce();
    // polling cada 5s
    this.statusInterval = globalThis.setInterval(fetchOnce, 5000);
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
    // No permitir confirmar sin items
    if (!this.pedidoState?.total || this.pedidoState.total <= 0) {
      this.errorMessage = 'Tu pedido está vacío. Agregá productos antes de continuar.';
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

    // Tomar primero del estado (más confiable), con fallback a params en la cadena de rutas
    const mesaId = this.pedidoState.mesaId
      || this.route.snapshot.paramMap.get('mesaId')
      || this.route.parent?.snapshot.paramMap.get('mesaId')
      || this.route.parent?.parent?.snapshot.paramMap.get('mesaId')
      || undefined;
    const area = this.pedidoState.area
      || this.route.snapshot.paramMap.get('area')
      || this.route.parent?.snapshot.paramMap.get('area')
      || this.route.parent?.parent?.snapshot.paramMap.get('area')
      || undefined;
    if (!mesaId || !area || !this.pedidoState.cliente) {
      this.errorMessage = 'Faltan datos para crear el pedido (mesa o cliente).';
      this.isLoading = false;
      return;
    }

    const itemsMap: Record<number, number> = {};
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

    // Guardar método de pago elegido en el estado para mostrarlo en la confirmación
    this.pedidoClienteService.setPagoMetodo(this.selectedMetodo || undefined);

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
        this.errorMessage = this.formatCrearPedidoError(err);
        this.isLoading = false;
      }
    });
  }

  private formatCrearPedidoError(err: any): string {
    // 409: mesa ocupada según backend. Mostrar mensaje claro y datos si existen
    if (err?.status === 409) {
      const msg = err?.error?.error || 'La mesa está ocupada en este momento.';
      const mesa = err?.error?.mesa_id ? ` Mesa: ${err.error.mesa_id}.` : '';
      const pedido = err?.error?.pedido_id ? ` Pedido ID: ${err.error.pedido_id}.` : '';
      return `${msg}${mesa}${pedido}`.trim();
    }
    if (err?.status === 400) {
      return err?.error?.error || 'Datos inválidos para crear el pedido.';
    }
    if (err?.status === 500) {
      return 'Error de servidor. Intenta nuevamente en unos segundos.';
    }
    return 'Hubo un error al crear tu pedido. Por favor, intenta de nuevo.';
  }
}
