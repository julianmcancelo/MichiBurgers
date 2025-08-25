import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
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
  // Mejoras de PDF/impresión
  columns = 3;
  gapMm = 4;
  includeLogo = true;
  textSizePt = 10;
  borderStyle: 'solid' | 'dashed' | 'none' = 'dashed';

  // Modo Afiche (branding MichiBurgers)
  posterMode = true; // si está activo, el PDF se genera como afiche por QR
  posterWidthMm = 100; // 100x150 mm por defecto
  posterHeightMm = 150;
  posterHeaderColor = '#0ea5e9'; // azul (puede mapear a tu tailwind primary/accent)
  posterTitle = 'MichiBurgers';
  posterSubtitle1 = 'Escaneá para pedir';
  posterSubtitle2 = '';
  // Estética tipo Tailwind
  posterBgColor = '#f8fafc'; // slate-50
  posterTextColor = '#111827'; // slate-900
  posterHeaderTextColor = '#ffffff';
  posterRadiusMm = 6; // esquinas redondeadas del "card" interior
  posterShowBorder = true; // borde sutil alrededor del card
  posterBorderColor = '#E5E7EB'; // color del borde del card
  posterBorderWidthMm = 0.6; // grosor del borde del card
  posterPaddingMm = 8; // padding interno del afiche
  posterHeaderHeightMm = 26; // alto de cabecera
  posterShadow = true; // sombra sutil detrás del card
  // Escala del QR respecto al contenedor disponible (0.4 - 0.95)
  posterQrScale = 0.72;
  // Marco sutil detrás del QR
  posterShowQrFrame = true;
  posterQrFrameColor = '#f3f4f6'; // slate-100
  posterQrFrameRadiusMm = 4;
  posterQrFramePaddingMm = 4;
  // Auto-escalado general a la hoja
  posterAutoScale = true;
  // Título auto-fit
  posterTitleAutoFit = true;
  posterTitleFontMax = 20;
  posterTitleFontMin = 12;
  posterFooterNote = '';
  // Tipografía
  posterFontFamily: 'helvetica' | 'times' | 'courier' = 'helvetica';
  posterUseCustomFont = true; // si existen en assets
  posterFontRegularUrl = '/assets/fonts/Poppins-Regular.ttf';
  posterFontBoldUrl = '/assets/fonts/Poppins-Bold.ttf';
  posterCtaIcon = false; // mostrar icono en CTA
  // Detalles gatunos (estética)
  catTheme = true;
  catPaws = true;
  catPawColor = '#e0f2fe'; // sky-100
  catPawSizeMm = 6; // tamaño base de la huella
  catPawCount = 5; // cuántas huellas sutiles
  catWhiskers = true;
  catWhiskerColor = '#94a3b8'; // slate-400
  catMascotUrl = '';
  catMascotBadge = true;
  catMascotBadgeSizeMm = 22;

  // CTA inferior estilo "sticker"
  showCta = true;
  ctaText = 'ESCANEA';
  ctaBgColor = '#0F172A'; // secondary-900
  ctaTextColor = '#FFFFFF';

  // Table sign mode settings
  tableSignMode = false;
  tableBgColor = '#e53935';
  tableTextColor = '#ffffff';
  tableBorderColor = '#b71c1c';
  tableBorderWidth = 10;
  tableTopText = 'MESA 1 - INTERIOR';
  tableBottomText = 'ESCANEAR PARA PEDIR';
  tableQrScale = 60; // Percentage of available space for QR code

  // (variables internas para PDF ya no se definen a nivel clase; se usan locales en métodos)

  // Preferencia: usar preset gatito por defecto al cargar
  useStickerCatByDefault = false;

  // (mantener la versión extendida más abajo para modo mesa)

  // Tamaños predefinidos
  sizePreset: 'A6' | 'A5' | 'SQUARE_120' | 'CUSTOM' = 'CUSTOM';
  applySizePreset(preset: 'A6' | 'A5' | 'SQUARE_120' | 'CUSTOM'): void {
    this.sizePreset = preset;
    switch (preset) {
      case 'A6':
        this.posterWidthMm = 105; // A6 portrait
        this.posterHeightMm = 148;
        break;
      case 'A5':
        this.posterWidthMm = 148; // A5 portrait
        this.posterHeightMm = 210;
        break;
      case 'SQUARE_120':
        this.posterWidthMm = 120;
        this.posterHeightMm = 120;
        break;
      default:
        break;
    }
  }

  // Cambiar entre modos de afiche y mesa
  onTableSignModeChange(): void {
    if (this.tableSignMode) {
      // Aplicar configuración por defecto para modo mesa
      this.posterMode = true;
      this.posterWidthMm = 100;
      this.posterHeightMm = 150;
      this.posterAutoScale = true;
      this.posterHeaderColor = this.tableBorderColor;
      this.posterHeaderTextColor = '#FFFFFF';
      this.posterBgColor = this.tableBgColor;
      this.posterTextColor = this.tableTextColor;
      this.posterRadiusMm = 8;
      this.posterShowBorder = false;
      this.posterTitle = this.tableTopText;
      this.posterSubtitle1 = this.tableBottomText;
      this.posterSubtitle2 = '';
      this.posterQrScale = this.tableQrScale / 100 * 0.9; // Ajustar escala
      this.catTheme = false;
      this.showCta = false;
    }
  }

  // Actualizar configuración cuando cambian los valores de la mesa
  updateTableSignSettings(): void {
    if (this.tableSignMode) {
      this.posterHeaderColor = this.tableBorderColor;
      this.posterBgColor = this.tableBgColor;
      this.posterTextColor = this.tableTextColor;
      this.posterTitle = this.tableTopText;
      this.posterSubtitle1 = this.tableBottomText;
      this.posterQrScale = this.tableQrScale / 100 * 0.9;
    }
  }

  // Preset rápido: Sticker Gatito (usa colores de la app)
  applyStickerCatPreset(): void {
    this.tableSignMode = false; // Asegurarse de salir del modo mesa
    // Colores app (tailwind.config.js): primary naranja, secondary slate
    this.posterMode = true;
    this.posterWidthMm = 100;
    this.posterHeightMm = 150;
    this.posterAutoScale = true;
    this.posterHeaderColor = '#EA580C'; // primary-600
    this.posterHeaderTextColor = '#FFFFFF';
    this.posterBgColor = '#FFFFFF';
    this.posterTextColor = '#334155'; // secondary-700
    this.posterRadiusMm = 8;
    this.posterShowBorder = true;
    this.posterQrScale = 0.72;
    this.posterShowQrFrame = true;
    this.posterQrFrameColor = '#F1F5F9'; // secondary-100
    this.posterQrFramePaddingMm = 5;
    this.posterQrFrameRadiusMm = 6;
    this.posterTitle = 'Menú';
    this.posterSubtitle1 = 'Escaneá para pedir';
    this.posterSubtitle2 = '';
    // Gatuno
    this.catTheme = true;
    this.catPaws = true;
    this.catPawColor = '#E2E8F0'; // secondary-200
    this.catPawCount = 5;
    this.catPawSizeMm = 6;
    this.catWhiskers = false; // el CTA hará de divisor
    this.catMascotBadge = true;
    // CTA
    this.showCta = true;
    this.ctaText = 'ESCANEÁ';
    this.ctaBgColor = '#0F172A'; // secondary-900
    this.ctaTextColor = '#FFFFFF';
  }

  // Angular v16+: preferir inject() sobre constructor
  private platformId = inject(PLATFORM_ID);
  private http = inject(HttpClient);
  private mapaSalonApi = inject(MapaSalonApiService);
  private snackBar = inject(MatSnackBar);
  private sanitizer = inject(DomSanitizer);
  private document = inject(DOCUMENT);

  // Browser detection
  isBrowser = false;

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    // Initialize component
    if (this.useStickerCatByDefault) {
      this.applyStickerCatPreset();
    }

    // Initialize table sign settings if needed
    if (this.tableSignMode) {
      this.updateTableSignSettings();
    }

    // Base URL según entorno
    if (this.isBrowser) {
      const w = globalThis as any;
      this.baseUrl = w?.location?.origin ?? environment.baseUrl;
    } else {
      this.baseUrl = environment.baseUrl;
    }

    this.mapaSalonApi.getLayout('interior').subscribe((data: Mesa[]) => this.layoutInterior = data);
    this.mapaSalonApi.getLayout('exterior').subscribe((data: Mesa[]) => this.layoutExterior = data);

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
      if (!this.isBrowser) { return; }
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

  // Generar y descargar PDF con estética (Afiche / Modo mesa / Grilla QR)
  async downloadPdf(): Promise<void> {
    if (!this.isBrowser) {
      (globalThis as any)?.console?.warn?.('PDF generation is only available in browser environment');
      return;
    }
    if (!this.generados?.length) return;

    const [{ jsPDF }, QRCode] = await Promise.all([
      import('jspdf') as unknown as Promise<{ jsPDF: any }>,
      import('qrcode') as unknown as Promise<any>,
    ]);

    if (this.posterMode) {
      const doc = new jsPDF({ unit: 'mm', format: [this.posterWidthMm, this.posterHeightMm] });
      const k = 1; // trabajamos en mm

      // Utilidad local
      const hexToRgb = (hex: string) => {
        const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '#000000');
        const r = m ? parseInt(m[1], 16) : 0;
        const g = m ? parseInt(m[2], 16) : 0;
        const b = m ? parseInt(m[3], 16) : 0;
        return { r, g, b };
      };

      // Carga opcional de fuentes personalizadas (TTF) desde assets
      const tryLoadCustomFonts = async () => {
        if (!this.posterUseCustomFont) return;
        try {
          const f: any = (globalThis as any).fetch;
          if (typeof f !== 'function') return;
          const [regRes, boldRes] = await Promise.all([
            f(this.posterFontRegularUrl),
            f(this.posterFontBoldUrl),
          ]);
          if (!regRes.ok || !boldRes.ok) return;
          const [regBuf, boldBuf] = await Promise.all([
            regRes.arrayBuffer(),
            boldRes.arrayBuffer(),
          ]);
          const toBase64 = (buf: ArrayBuffer) => {
            let binary = '';
            const bytes = new Uint8Array(buf);
            const len = bytes.byteLength;
            for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
            const b64 = (globalThis as any).btoa;
            return typeof b64 === 'function' ? b64(binary) : '';
          };
          const regB64 = toBase64(regBuf);
          const boldB64 = toBase64(boldBuf);
          const family = 'CustomPosterFont';
          // Registrar en VFS y asociar la fuente
          (doc as any).addFileToVFS('custom-regular.ttf', regB64);
          (doc as any).addFileToVFS('custom-bold.ttf', boldB64);
          (doc as any).addFont('custom-regular.ttf', family, 'normal');
          (doc as any).addFont('custom-bold.ttf', family, 'bold');
          (doc as any)._posterFontName = family;
        } catch {
          // fallback silencioso a fuentes por defecto
        }
      };
      await tryLoadCustomFonts();

      // Carga opcional de imágenes
      const loadAsDataUrl = (src?: string) => new Promise<string>((resolve) => {
        try {
          if (!src) return resolve('');
          const img = new (globalThis as any).Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            try {
              const canvas = (globalThis as any).document.createElement('canvas');
              canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
              const ctx = canvas.getContext('2d');
              if (!ctx) return resolve('');
              ctx.drawImage(img, 0, 0);
              resolve(canvas.toDataURL('image/png'));
            } catch { resolve(''); }
          };
          img.onerror = () => resolve('');
          img.src = src;
        } catch { resolve(''); }
      });

      const logoUrl = await loadAsDataUrl('/assets/images/logo.png');
      const mascotUrl = await loadAsDataUrl(this.catMascotUrl);

      for (let i = 0; i < this.generados.length; i++) {
        const g = this.generados[i];
        const data = g.url || g.path || '';
        if (!data) continue;

        // Fondo
        const { r: bgr, g: bgg, b: bgb } = hexToRgb(this.posterBgColor);
        doc.setFillColor(bgr, bgg, bgb);
        doc.rect(0, 0, this.posterWidthMm, this.posterHeightMm, 'F');

        // Card interior con bordes redondeados y borde opcional
        const pad = Math.max(0, this.posterPaddingMm);
        const cardX = pad;
        const cardY = pad;
        const cardW = this.posterWidthMm - pad * 2;
        const cardH = this.posterHeightMm - pad * 2;
        const rr = Math.max(0, this.posterRadiusMm);
        const dAny: any = doc;
        if (this.posterShowBorder) {
          const { r: brdR, g: brdG, b: brdB } = hexToRgb(this.posterBorderColor);
          doc.setDrawColor(brdR, brdG, brdB);
          doc.setLineWidth(Math.max(0.2, this.posterBorderWidthMm));
          if (typeof dAny.roundedRect === 'function' && rr > 0) dAny.roundedRect(cardX, cardY, cardW, cardH, rr, rr);
          else doc.rect(cardX, cardY, cardW, cardH);
        }

        // Sombra sutil (fake) del card
        if (this.posterShadow) {
          const sx = cardX + 1.2; const sy = cardY + 1.8;
          doc.setDrawColor(240, 241, 245);
          if (typeof dAny.roundedRect === 'function' && rr > 0) dAny.roundedRect(sx, sy, cardW, cardH, rr, rr);
          else doc.rect(sx, sy, cardW, cardH);
        }

        // Header
        const headerH = Math.max(16, this.posterHeaderHeightMm);
        const { r: hr, g: hg, b: hb } = hexToRgb(this.posterHeaderColor);
        doc.setFillColor(hr, hg, hb);
        if (typeof dAny.roundedRect === 'function' && rr > 0) {
          // header con esquinas superiores redondeadas
          dAny.roundedRect(cardX, cardY, cardW, headerH, rr, rr, 'F');
          // tapar la parte inferior de los radios para que el resto del card quede "sin fill"
          doc.setFillColor(hr, hg, hb);
          doc.rect(cardX, cardY, cardW, headerH, 'F');
        } else {
          doc.rect(cardX, cardY, cardW, headerH, 'F');
        }

        // Logo + título
        let xCursor = cardX + 6;
        if (logoUrl) {
          const logoH = Math.min(headerH - 6, 18);
          const logoW = logoH * 1.6;
          doc.addImage(logoUrl, 'PNG', xCursor, cardY + (headerH - logoH) / 2, logoW, logoH, undefined, 'FAST');
          xCursor += logoW + 3;
        }
        const { r: htR, g: htG, b: htB } = hexToRgb(this.posterHeaderTextColor);
        doc.setTextColor(htR, htG, htB);
        // Selección de fuente (fallback si no se pudo cargar custom)
        // Nota: la carga ocurre más arriba antes del bucle
        try { doc.setFont((doc as any)._posterFontName || this.posterFontFamily, 'bold'); } catch { doc.setFont('helvetica', 'bold'); }
        const title = this.posterTitle || 'MichiBurgers';
        // Ajuste automático del tamaño del título para caber en el header
        if (this.posterTitleAutoFit) {
          // Centramos el título: el ancho útil es el cardW menos márgenes laterales
          const lateralMargin = (this.catTheme && this.catMascotBadge ? 28 : 12) + (logoUrl ? 24 : 12);
          const maxW = Math.max(24, cardW - lateralMargin * 2);
          let size = Math.max(this.posterTitleFontMin, Math.min(this.posterTitleFontMax, 20));
          doc.setFontSize(size);
          while (size > this.posterTitleFontMin && doc.getTextWidth(title) > maxW) {
            size -= 1; doc.setFontSize(size);
          }
        } else {
          doc.setFontSize(Math.max(this.posterTitleFontMin, Math.min(this.posterTitleFontMax, 18)));
        }
        // Texto centrado en el header
        doc.text(title, cardX + cardW / 2, cardY + headerH / 2 + 4.5, { baseline: 'middle' as any, align: 'center' as any });

        // Mascota (badge) opcional en header
        if (this.catTheme && this.catMascotBadge && mascotUrl) {
          const badgeSize = Math.max(14, this.catMascotBadgeSizeMm);
          const radius = badgeSize / 2;
          const bx = cardX + cardW - radius - 6;
          const by = cardY + headerH / 2;
          doc.setFillColor(255, 255, 255);
          doc.setDrawColor(230, 232, 239);
          doc.setLineWidth(0.4);
          doc.circle(bx, by, radius, 'FD');
          const imgPad = badgeSize * 0.18;
          const imgSide = badgeSize - imgPad * 2;
          doc.addImage(mascotUrl, 'PNG', bx - imgSide / 2, by - imgSide / 2, imgSide, imgSide, undefined, 'FAST');
        }

        // Paws sutiles
        if (this.catTheme && this.catPaws && this.catPawCount > 0) {
          const pawSize = Math.max(3, this.catPawSizeMm);
          const { r: pr, g: pg, b: pb } = hexToRgb(this.catPawColor);
          doc.setFillColor(pr, pg, pb);
          const cols = Math.max(1, Math.ceil(Math.sqrt(this.catPawCount)));
          const rows = Math.max(1, Math.ceil(this.catPawCount / cols));
          const bodyTop = cardY + headerH + 2 * k;
          const bodyHeight = cardH - headerH - 4 * k;
          let placed = 0;
          for (let ry = 0; ry < rows; ry++) {
            for (let cx = 0; cx < cols; cx++) {
              if (placed >= this.catPawCount) break;
              const px = cardX + (cardW / (cols + 1)) * (cx + 1) + (ry % 2 === 0 ? 2 : -2);
              const py = bodyTop + (bodyHeight / (rows + 1)) * (ry + 1);
              const bigR = pawSize * 0.6;
              const toeR = pawSize * 0.22;
              doc.circle(px, py, bigR, 'F');
              doc.circle(px - bigR * 0.6, py - bigR * 0.9, toeR, 'F');
              doc.circle(px, py - bigR * 1.0, toeR, 'F');
              doc.circle(px + bigR * 0.6, py - bigR * 0.9, toeR, 'F');
              placed++;
            }
          }
        }

        // Contenedor QR (con marco opcional)
        const bodyTop = cardY + headerH + 4;
        const bodyHeight = cardH - headerH - (this.showCta && !this.tableSignMode ? 18 : 10) - 8;
        const boxCenterX = cardX + cardW / 2;
        const boxCenterY = bodyTop + bodyHeight / 2;
        const maxSide = Math.min(cardW * 0.86, bodyHeight * 0.86);

        // Modo mesa: borde grueso y textos propios
        if (this.tableSignMode) {
          const bw = Math.max(0, this.tableBorderWidth);
          const { r: br, g: bg, b: bb } = hexToRgb(this.tableBorderColor);
          doc.setDrawColor(br, bg, bb);
          doc.setLineWidth(bw);
          if (typeof dAny.roundedRect === 'function' && rr > 0) dAny.roundedRect(cardX + bw / 2, cardY + bw / 2, cardW - bw, cardH - bw, rr, rr);
          else doc.rect(cardX + bw / 2, cardY + bw / 2, cardW - bw, cardH - bw);

          const { r: tbr, g: tbg, b: tbb } = hexToRgb(this.tableTextColor);
          doc.setTextColor(tbr, tbg, tbb);
          try { doc.setFont((doc as any)._posterFontName || this.posterFontFamily, 'bold'); } catch { doc.setFont('helvetica', 'bold'); }
          doc.setFontSize(18);
          doc.text(this.tableTopText || '', cardX + cardW / 2, cardY + headerH + 8, { align: 'center' as any });
        }

        const qrScale = this.tableSignMode ? Math.max(0.2, Math.min(0.95, this.tableQrScale / 100)) : Math.max(0.2, Math.min(0.95, this.posterQrScale));
        const framePad = this.posterShowQrFrame ? Math.max(1, this.posterQrFramePaddingMm) : 0;
        const qrSide = maxSide * qrScale;
        const frameSide = qrSide + framePad * 2;
        if (this.posterShowQrFrame) {
          const { r: fr, g: fg, b: fb } = hexToRgb(this.posterQrFrameColor);
          doc.setFillColor(fr, fg, fb);
          const rr2 = Math.max(0, this.posterQrFrameRadiusMm);
          const fx = boxCenterX - frameSide / 2;
          const fy = boxCenterY - frameSide / 2;
          if (typeof dAny.roundedRect === 'function' && rr2 > 0) dAny.roundedRect(fx, fy, frameSide, frameSide, rr2, rr2, 'F');
          else doc.rect(fx, fy, frameSide, frameSide, 'F');
        }

        const qrPx = Math.max(128, Math.floor(qrSide * 3.78));
        const qrUrl = await QRCode.toDataURL(data, { width: qrPx, margin: 0 });
        doc.addImage(qrUrl, 'PNG', boxCenterX - qrSide / 2, boxCenterY - qrSide / 2, qrSide, qrSide, undefined, 'FAST');

        // Whiskers divisor
        if (this.catTheme && this.catWhiskers && !this.tableSignMode) {
          const wy = cardY + cardH - 24;
          const wl = 24; const gap = 12;
          const { r: wr, g: wg, b: wb } = hexToRgb(this.catWhiskerColor);
          doc.setDrawColor(wr, wg, wb); doc.setLineWidth(0.6);
          doc.line(cardX + cardW / 2 - gap - wl, wy, cardX + cardW / 2 - gap, wy);
          doc.line(cardX + cardW / 2 - gap - wl * 0.9, wy - 2 * k, cardX + cardW / 2 - gap, wy - 2 * k);
          doc.line(cardX + cardW / 2 - gap - wl * 0.9, wy + 2 * k, cardX + cardW / 2 - gap, wy + 2 * k);
          doc.line(cardX + cardW / 2 + gap, wy, cardX + cardW / 2 + gap + wl, wy);
          doc.line(cardX + cardW / 2 + gap, wy - 2 * k, cardX + cardW / 2 + gap + wl * 0.9, wy - 2 * k);
          doc.line(cardX + cardW / 2 + gap, wy + 2 * k, cardX + cardW / 2 + gap + wl * 0.9, wy + 2 * k);
        }

        // Subtítulos o texto inferior
        const { r: tr, g: tg, b: tb } = hexToRgb(this.posterTextColor);
        doc.setTextColor(tr, tg, tb);
        if (this.tableSignMode) {
          try { doc.setFont((doc as any)._posterFontName || this.posterFontFamily, 'bold'); } catch { doc.setFont('helvetica', 'bold'); }
          doc.setFontSize(16);
          doc.text(this.tableBottomText || '', cardX + cardW / 2, cardY + cardH - 12, { align: 'center' as any });
        } else {
          try { doc.setFont((doc as any)._posterFontName || this.posterFontFamily, 'bold'); } catch { doc.setFont('helvetica', 'bold'); }
          doc.setFontSize(18);
          if (this.posterSubtitle1) doc.text(this.posterSubtitle1, cardX + cardW / 2, cardY + cardH - (this.showCta ? 22 : 14), { align: 'center' as any });
          try { doc.setFont((doc as any)._posterFontName || this.posterFontFamily, 'normal'); } catch { doc.setFont('helvetica', 'normal'); }
          doc.setFontSize(12);
          if (this.posterSubtitle2) doc.text(this.posterSubtitle2, cardX + cardW / 2, cardY + cardH - (this.showCta ? 14 : 8), { align: 'center' as any });
        }

        // CTA pill inferior (solo si no es modo mesa)
        if (this.showCta && !this.tableSignMode) {
          const pillH = 12;
          const pillW = Math.min(cardW * 0.72, 96);
          const px = cardX + (cardW - pillW) / 2;
          const py = cardY + cardH - pillH - 6 * k;
          const { r: cr, g: cg, b: cb } = hexToRgb(this.ctaBgColor);
          doc.setFillColor(cr, cg, cb);
          const rrPill = pillH / 2;
          if (typeof dAny.roundedRect === 'function') dAny.roundedRect(px, py, pillW, pillH, rrPill, rrPill, 'F');
          else doc.rect(px, py, pillW, pillH, 'F');
          // icono opcional
          if (this.posterCtaIcon) {
            doc.setFillColor(255, 255, 255);
            const iconW = pillH * 0.5; const iconH = pillH * 0.68;
            const ix = px + pillH * 0.35; const iy = py + (pillH - iconH) / 2;
            const corner = Math.max(0.8, pillH * 0.1);
            if (typeof dAny.roundedRect === 'function') dAny.roundedRect(ix, iy, iconW, iconH, corner, corner, 'F');
            else doc.rect(ix, iy, iconW, iconH, 'F');
          }
          const { r: tcr, g: tcg, b: tcb } = hexToRgb(this.ctaTextColor);
          doc.setTextColor(tcr, tcg, tcb);
          try { doc.setFont((doc as any)._posterFontName || this.posterFontFamily, 'bold'); } catch { doc.setFont('helvetica', 'bold'); }
          doc.setFontSize(12);
          const cta = this.ctaText || 'ESCANEÁ';
          const tx = px + pillW / 2;
          const ty = py + pillH / 2 + 3;
          doc.text(cta, tx, ty, { baseline: 'middle' as any, align: 'center' as any });
        }

        // Nota de pie opcional
        if (!this.tableSignMode && this.posterFooterNote) {
          const { r: fr, g: fg, b: fb } = hexToRgb(this.posterTextColor);
          doc.setTextColor(fr, fg, fb);
          doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
          doc.text(this.posterFooterNote, cardX + cardW / 2, cardY + cardH - 4, { align: 'center' as any });
        }

        if (i < this.generados.length - 1) doc.addPage([this.posterWidthMm, this.posterHeightMm], 'portrait');
      }
      doc.save('afiche-qr.pdf');
      return;
    }

    // ========== MODO SOLO QR (grid) ==========
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageWidth: number = doc.internal.pageSize.getWidth();
    const pageHeight: number = doc.internal.pageSize.getHeight();

    const cols = Math.max(1, Math.floor(this.columns || 1));
    const gap = Math.max(0, this.gapMm || 0);
    const labelW = Math.max(10, this.labelWidthMm || 30);
    const labelH = Math.max(10, this.labelHeightMm || 30);
    const qrSide = Math.min(labelW, labelH);

    let x = 10; // margen inicial
    let y = 10;
    const maxContentWidth = pageWidth - 20; // márgenes izq/der
    const maxContentHeight = pageHeight - 20; // márgenes sup/inf
    const totalRowWidth = cols * labelW + (cols - 1) * gap;
    if (totalRowWidth > maxContentWidth) {
      // ajustar columnas efectivas
    }
    const useCols = Math.max(1, Math.min(cols, Math.floor((maxContentWidth + gap) / (labelW + gap))));

    let colIndex = 0;
    for (const g of this.generados) {
      const copies = this.copiasArray(this.copias);
      for (const _ of copies) { void _;
        const data = g.url || g.path || '';
        if (!data) continue;
        const px = Math.max(64, Math.floor(qrSide * 3.78));
        const dataUrl = await QRCode.toDataURL(data, { width: px, margin: 0 });

        if (y + qrSide > maxContentHeight) {
          doc.addPage();
          x = 10; y = 10; colIndex = 0;
        }
        doc.addImage(dataUrl, 'PNG', x, y, qrSide, qrSide, undefined, 'FAST');

        colIndex++;
        if (colIndex >= useCols) { colIndex = 0; x = 10; y += qrSide + gap; }
        else { x += qrSide + gap; }
      }
    }
    doc.save('qr-etiquetas.pdf');
  }

  // Calcula el ancho del QR (px) a partir del ancho de la etiqueta (mm)
  getQrPxWidth(): number {
    // 1mm ~ 3.78px en pantallas típicas.
    // Reservar padding y espacio para texto/logo si están activos.
    const paddingMm = 6; // coincide con padding label-box
    const usableWidthMm = Math.max(10, this.labelWidthMm - paddingMm * 2);
    const usableHeightMm = Math.max(
      10,
      this.labelHeightMm - paddingMm * 2 - (this.includeTexto ? 8 : 0) - (this.includeLogo ? 8 : 0)
    );
    const sideMm = Math.max(10, Math.min(usableWidthMm, usableHeightMm));
    const px = Math.floor(sideMm * 3.78);
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

  // (duplicado de ngOnInit eliminado)

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
    if (this.isBrowser) {
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
      const ingresada = this.isBrowser ? (globalThis as any)?.window?.prompt('Ingresá el número de mesa') : '';
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
