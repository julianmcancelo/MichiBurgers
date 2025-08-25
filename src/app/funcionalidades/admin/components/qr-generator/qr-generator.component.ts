import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { MapaSalonApiService } from '../../../mapa-meses/services/mapa-salon-api.service';
import { QRCodeComponent } from 'angularx-qrcode';

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
  // Por defecto usar el origen actual para que el enlace funcione en el host donde corre la app
  baseUrl = typeof window !== 'undefined' ? window.location.origin : environment.baseUrl;

  // Controles manuales
  areaManual: 'interior' | 'exterior' = 'interior';
  mesaManual: string = '';

  layoutInterior: Mesa[] = [];
  layoutExterior: Mesa[] = [];

  constructor(
    private http: HttpClient,
    private mapaSalonService: MapaSalonApiService
  ) {}

  ngOnInit(): void {
    this.mapaSalonService.getLayout('interior').subscribe(data => this.layoutInterior = data);
    this.mapaSalonService.getLayout('exterior').subscribe(data => this.layoutExterior = data);
  }

  async generar(area: string, mesaId?: string): Promise<void> {
    this.loading = true;
    this.error = null;
    this.resultado = null;

    // Si no se indicó mesa, solicitarla
    if (!mesaId || String(mesaId).trim() === '') {
      const ingresada = typeof window !== 'undefined' ? window.prompt('Ingresá el número de mesa') : '';
      mesaId = (ingresada || '').trim();
      if (!mesaId) {
        this.loading = false;
        this.error = 'Necesitamos el número de mesa para generar el QR';
        return;
      }
      this.mesaManual = mesaId;
    }

    // Token opcional (admin/master) para endpoints protegidos
    const token = typeof window !== 'undefined'
      ? (localStorage.getItem('auth_token') || localStorage.getItem('master_token') || '')
      : '';

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
      console.error('Error al llamar /api/qr/generar.php', e);
      this.resultado = this.generarLocal(area, mesaId);
      this.error = null;
    } finally {
      this.loading = false;
    }
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
      await navigator.clipboard.writeText(text);
      this.error = null;
    } catch {
      this.error = 'No se pudo copiar al portapapeles';
    }
  }
}
