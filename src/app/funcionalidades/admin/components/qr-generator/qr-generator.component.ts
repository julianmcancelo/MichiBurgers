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

  // Historial/listado de QRs generados en esta sesión
  generados: GenerarResp[] = [];

  // Configuración de impresión de etiquetas
  labelWidthMm = 50;
  labelHeightMm = 50;
  includeTexto = true;
  copias = 1;

  // Angular v16+: preferir inject() sobre constructor
  private http = inject(HttpClient);
  private mapaSalonService = inject(MapaSalonApiService);
  private platformId = inject(PLATFORM_ID);

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  // =====================
  // Sincronización servidor
  // =====================
  private async upsertServer(item: GenerarResp): Promise<void> {
    try {
      const body = { area: item.area, mesa: item.mesa, url: item.url ?? null, path: item.path } as const;
      await firstValueFrom(this.http.post<{ ok: boolean }>(`/api/qr/guardar.php`, body));
    } catch {
      // ignorar fallos (offline, etc.)
    }
  }

  private async loadFromServer(): Promise<void> {
    try {
      const resp = await firstValueFrom(this.http.get<{ ok: boolean; items: { area: string; mesa: string; url?: string | null; path: string }[]; }>(`/api/qr/listar.php`));
      if (!resp?.ok || !Array.isArray(resp.items)) return;
      const map = new Map<string, GenerarResp>();
      // primero los locales
      for (const g of this.generados) {
        if (!g?.area || !g?.mesa) continue;
        map.set(`${g.area}-${g.mesa}`, g);
      }
      // luego los del servidor (pisan locales)
      for (const s of resp.items) {
        if (!s?.area || !s?.mesa || !s?.path) continue;
        map.set(`${s.area}-${s.mesa}`, { ok: true, area: s.area, mesa: s.mesa, path: s.path, url: s.url ?? null });
      }
      this.generados = Array.from(map.values()).sort((a,b) => `${a.area}-${a.mesa}`.localeCompare(`${b.area}-${b.mesa}`));
      this.saveGenerados();
    } catch {
      // ignorar fallos
    }
  }

  private saveGenerados(): void {
    try {
      const ls = (globalThis as any)?.localStorage;
      ls?.setItem('qr_generados', JSON.stringify(this.generados));
    } catch { /* noop */ }
  }

  clearGenerados(): void {
    this.generados = [];
    try { (globalThis as any)?.localStorage?.removeItem('qr_generados'); } catch { /* noop */ }
  }

  exportGenerados(): void {
    try {
      if (!this.isBrowser()) { return; }
      const g = (globalThis as any);
      const data = new Blob([JSON.stringify(this.generados, null, 2)], { type: 'application/json' });
      const url = g.URL?.createObjectURL ? g.URL.createObjectURL(data) : null;
      if (!url) { return; }
      const a = g.document?.createElement?.('a');
      if (!a) { return; }
      a.href = url;
      a.download = 'qr-generados.json';
      a.click();
      if (g.setTimeout && g.URL?.revokeObjectURL) {
        g.setTimeout(() => g.URL.revokeObjectURL(url), 1000);
      }
    } catch { /* noop */ }
  }

  // Utilidad para repetir etiquetas por cantidad de copias
  copiasArray(n: number): number[] {
    const c = Math.max(1, Math.min(100, Math.floor(n || 1)));
    return Array.from({ length: c }).map((_, i) => i);
  }

  // Disparar impresión del navegador
  print(): void {
    const w = (globalThis as any);
    if (w?.print) { w.print(); }
  }

  // Calcula el ancho del QR (px) a partir del ancho de la etiqueta (mm)
  getQrPxWidth(): number {
    // 1mm ~ 3.78px en pantallas típicas. Dejamos un margen interior de 12px
    const px = Math.floor(this.labelWidthMm * 3.78) - 12;
    return Math.max(64, px);
  }

  /** Agrega o reemplaza (de-duplica por area+mesa) en el listado de generados */
  private pushGenerado(item: GenerarResp): void {
    const key = `${item.area}-${item.mesa}`;
    const idx = this.generados.findIndex(g => `${g.area}-${g.mesa}` === key);
    if (idx >= 0) {
      this.generados[idx] = item;
    } else {
      this.generados.push(item);
    }
    this.saveGenerados();
    // Mejor esfuerzo: sincronizar con servidor
    this.upsertServer(item).catch(() => {/* noop */});
  }

  /** Genera QR para todas las mesas del área seleccionada */
  async generarTodos(area: 'interior' | 'exterior'): Promise<void> {
    const layout = area === 'interior' ? this.layoutInterior : this.layoutExterior;
    for (const mesa of layout) {
      await this.generar(area, mesa.id);
    }
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

    // Cargar lista persistida (localStorage)
    try {
      const ls = (globalThis as any)?.localStorage;
      const raw = ls?.getItem('qr_generados');
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) {
          this.generados = arr.filter(x => x && x.area && x.mesa && (x.url || x.path));
        }
      }
    } catch { /* noop */ }

    // Intentar cargar desde el servidor y fusionar
    this.loadFromServer();
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
      // Registrar en la lista de generados
      if (this.resultado) {
        this.pushGenerado({
          ok: true,
          area: area as any,
          mesa: mesaId,
          path: this.resultado.path,
          url: this.resultado.url ?? null,
        });
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

  /** Copia un item particular del listado de generados */
  async copyGenerado(item: GenerarResp): Promise<void> {
    const text = item?.url ?? item?.path ?? '';
    if (!text) return;
    try {
      const nav = (globalThis as any)?.navigator;
      await nav?.clipboard?.writeText?.(text);
    } catch {
      // silencio: no bloquear UI por falla de clipboard
    }
  }
}
