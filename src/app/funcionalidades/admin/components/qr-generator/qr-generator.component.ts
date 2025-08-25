import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { QRCodeComponent } from 'angularx-qrcode';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { MapaSalonApiService } from '../../../mapa-meses/services/mapa-salon-api.service';

interface GenerarResp {
  ok: boolean;
  area?: string;
  mesa?: string;
  path: string;
  url?: string | null;
  error?: string;
}

interface Mesa {
  id: string;
  x: number;
  y: number;
  tipo: 'redonda' | 'cuadrada';
}

@Component({
  selector: 'app-qr-generator',
  templateUrl: './qr-generator.component.html',
  styleUrls: ['./qr-generator.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, QRCodeComponent],
})
export class QrGeneratorComponent implements OnInit {
  loading = false;
  error: string | null = null;
  resultado: GenerarResp | null = null;
  // Se define en ngOnInit según plataforma
  baseUrl = '';

  // Controles manuales
  areaManual: 'interior' | 'exterior' = 'interior';
  mesaManual = '';

  layoutInterior: Mesa[] = [];
  layoutExterior: Mesa[] = [];

  // Angular v16+: preferir inject() sobre constructor
  private http = inject(HttpClient);
  private mapaSalonService = inject(MapaSalonApiService);
  private platformId = inject(PLATFORM_ID);

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    // Base URL según entorno
    if (this.isBrowser()) {
      const w = globalThis as any;
      this.baseUrl = w?.location?.origin ?? environment.baseUrl;
    } else {
      this.baseUrl = environment.baseUrl;
    }

    this.mapaSalonService.getLayout('interior').subscribe(data => this.layoutInterior = data);
    this.mapaSalonService.getLayout('exterior').subscribe(data => this.layoutExterior = data);
  }

  /**
   * Generación desde interacciones del mapa u orígenes que ya conocen la mesa.
   * No realiza prompts. Si la mesa no es válida, ignora la acción sin tocar estado.
   */
  async generar(area: string, mesaId?: string): Promise<void> {
    // Validación estricta para evitar activaciones accidentales
    if (!mesaId || String(mesaId).trim() === '') {
      return; // no iniciar loading ni mostrar errores si vino de un click extraño
    }

    this.loading = true;
    this.error = null;
    this.resultado = null;

    // Token opcional (admin/master) para endpoints protegidos
    let token = '';
    if (this.isBrowser()) {
      const ls = (globalThis as any)?.localStorage;
      token = ls?.getItem('auth_token') || ls?.getItem('master_token') || '';
    }

    const body = {
      area,
      mesa: mesaId,
      baseUrl: this.baseUrl,
      token,
    };

    try {
      const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
      const resp = await firstValueFrom(
        this.http.post<GenerarResp>(`${environment.apiUrl}/qr/generar.php`, body, { headers })
      );
      if (!resp?.ok) {
        // Fallback local si el backend no autoriza o falla
        this.resultado = this.generarLocal(area, mesaId);
        this.error = null;
      } else {
        this.resultado = resp;
      }
    } catch (e: any) {
      // Log detallado y fallback local
      (globalThis as any)?.console?.error('Error al llamar /api/qr/generar.php', e);
      this.resultado = this.generarLocal(area, mesaId);
      this.error = null;
    } finally {
      this.loading = false;
    }
  }

  /**
   * Generación iniciada desde el formulario manual/botón.
   * Si no hay mesa, solicita el número (opcionalmente) y luego delega en generar().
   */
  async generarManual(): Promise<void> {
    let mesaId = (this.mesaManual || '').trim();
    if (!mesaId) {
      const ingresada = this.isBrowser() ? (globalThis as any)?.window?.prompt('Ingresá el número de mesa') : '';
      mesaId = (ingresada || '').trim();
      if (!mesaId) {
        this.error = 'Necesitamos el número de mesa para generar el QR';
        return;
      }
      this.mesaManual = mesaId;
    }
    await this.generar(this.areaManual, mesaId);
  }

  private generarLocal(area: string, mesaId: string): GenerarResp {
    const path = `/pedido-qr/${encodeURIComponent(area)}/${encodeURIComponent(mesaId)}`;
    const url = this.baseUrl ? `${this.baseUrl.replace(/\/$/, '')}${path}` : null;
    return { ok: true, area, mesa: mesaId, path, url } as GenerarResp;
  }

  /** Copia la URL/path generado al portapapeles. */
  async copy(): Promise<void> {
    const text = this.resultado?.url ?? this.resultado?.path ?? '';
    if (!text) return;
    try {
      const nav = (globalThis as any)?.navigator;
      await nav?.clipboard?.writeText?.(text);
      this.error = null;
    } catch {
      this.error = 'No se pudo copiar al portapapeles';
    }
  }
}
