import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertController, ToastController } from '@ionic/angular';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { firstValueFrom, interval, Subject, switchMap, takeUntil } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { MapaSalonApi, EstadoMesasResponse, MesaEstado } from '../../core/api/mapa-salon-api';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-mesas',
  templateUrl: './mesas.page.html',
  styleUrls: ['./mesas.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class MesasPage implements OnInit, OnDestroy {
  area: 'interior' | 'exterior' = 'interior';
  data?: EstadoMesasResponse;
  mesas: MesaEstado[] = [];
  loading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private api: MapaSalonApi,
    private toast: ToastController,
    private alert: AlertController,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    // initial load
    this.fetch();
    // polling every 7s
    interval(7000)
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => this.api.getEstado(this.area))
      )
      .subscribe({
        next: (res) => this.applyData(res),
      });
  }

  openPedido(m: MesaEstado) {
    if (!m.pedidoId) return;
    this.router.navigate(['/pedido', m.pedidoId]);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async fetch() {
    this.loading = true;
    this.api.getEstado(this.area).subscribe({
      next: (res) => this.applyData(res),
      error: async () => {
        this.loading = false;
        await this.showToast('Error cargando estado de mesas');
      }
    });
  }

  private applyData(res: EstadoMesasResponse) {
    this.data = res;
    this.mesas = (res?.mesas ?? []).sort((a, b) => a.mesaId.localeCompare(b.mesaId));
    this.loading = false;
  }

  async changeArea(area: 'interior' | 'exterior') {
    if (this.area === area) return;
    this.area = area;
    await this.fetch();
  }

  onAreaChange(ev: CustomEvent) {
    const val = (ev as any)?.detail?.value as string | undefined;
    const next: 'interior' | 'exterior' = (val === 'exterior') ? 'exterior' : 'interior';
    this.changeArea(next);
  }

  private get token(): string | undefined {
    return (localStorage.getItem('auth_token') || undefined) as any;
  }

  private set token(val: string | undefined) {
    if (!val) localStorage.removeItem('auth_token');
    else localStorage.setItem('auth_token', val);
  }

  private async ensureAuth(): Promise<void> {
    if (this.token) return;
    const al = await this.alert.create({
      header: 'Iniciar sesión',
      inputs: [
        { name: 'legajo', type: 'text', placeholder: 'Legajo' },
        { name: 'password', type: 'password', placeholder: 'Password' }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Ingresar', role: 'confirm' }
      ]
    });
    await al.present();
    const r = await al.onDidDismiss();
    if (r.role !== 'confirm') throw new Error('auth-cancelled');
    const legajo = r.data?.values?.legajo?.trim();
    const password = r.data?.values?.password ?? '';
    if (!legajo || !password) throw new Error('auth-missing');
    try {
      const resp = await firstValueFrom(this.http.post<{ token: string }>(`${environment.apiBase}/api/auth/login.php`, { legajo, password }));
      this.token = resp?.token;
      await this.showToast('Sesión iniciada');
    } catch (e) {
      this.token = undefined;
      await this.showToast('Login inválido');
      throw e;
    }
  }

  async abrir(m: MesaEstado) {
    try {
      await this.ensureAuth();
      const res = await firstValueFrom(this.api.abrirMesa({ area: this.area, mesaId: m.mesaId, token: this.token }));
      await this.showToast(res?.yaOcupada ? 'Mesa ya ocupada' : 'Mesa abierta');
      this.fetch();
    } catch (e: any) {
      if (e?.status === 401 || e?.status === 403) {
        this.token = undefined;
        try {
          await this.ensureAuth();
          const res = await firstValueFrom(this.api.abrirMesa({ area: this.area, mesaId: m.mesaId, token: this.token }));
          await this.showToast(res?.yaOcupada ? 'Mesa ya ocupada' : 'Mesa abierta');
          this.fetch();
          return;
        } catch {}
      }
      await this.showToast('No se pudo abrir');
    }
  }

  async liberar(m: MesaEstado) {
    try {
      await this.ensureAuth();
      const res = await firstValueFrom(this.api.liberarMesa({ area: this.area, mesaId: m.mesaId, token: this.token }));
      await this.showToast(res?.yaLibre ? 'Ya estaba libre' : 'Mesa liberada');
      this.fetch();
    } catch (e: any) {
      if (e?.status === 401 || e?.status === 403) {
        this.token = undefined;
        try {
          await this.ensureAuth();
          const res = await firstValueFrom(this.api.liberarMesa({ area: this.area, mesaId: m.mesaId, token: this.token }));
          await this.showToast(res?.yaLibre ? 'Ya estaba libre' : 'Mesa liberada');
          this.fetch();
          return;
        } catch {}
      }
      await this.showToast('No se pudo liberar');
    }
  }

  async pagar(m: MesaEstado) {
    if (!m.pedidoId) return;
    const al = await this.alert.create({
      header: `Pagar Pedido #${m.pedidoId}`,
      inputs: [
        { name: 'monto', type: 'number', placeholder: 'Monto (opcional)' },
        { name: 'metodo', type: 'text', value: 'efectivo', placeholder: 'Método' },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Confirmar', role: 'confirm' }
      ]
    });
    await al.present();
    const r = await al.onDidDismiss();
    if (r.role !== 'confirm') return;
    const monto = r.data?.values?.monto ? parseFloat(r.data.values.monto) : undefined;
    const metodo = r.data?.values?.metodo || 'efectivo';
    try {
      await this.ensureAuth();
      await firstValueFrom(this.api.pagar({ pedidoId: m.pedidoId, monto: Number.isFinite(monto!) ? monto! : undefined, metodo, token: this.token }));
      await this.showToast('Pedido pagado');
      this.fetch();
    } catch (e: any) {
      if (e?.status === 401 || e?.status === 403) {
        this.token = undefined;
        try {
          await this.ensureAuth();
          await firstValueFrom(this.api.pagar({ pedidoId: m.pedidoId, monto: Number.isFinite(monto!) ? monto! : undefined, metodo, token: this.token }));
          await this.showToast('Pedido pagado');
          this.fetch();
          return;
        } catch {}
      }
      await this.showToast('No se pudo pagar');
    }
  }

  private async showToast(message: string) {
    const t = await this.toast.create({ message, duration: 1600, position: 'bottom' });
    await t.present();
  }
}
