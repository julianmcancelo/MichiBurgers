import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

/**
 * Generador de QR para mesas/áreas.
 * Envía datos al backend PHP y muestra el resultado (URL/path) con opción de copiar.
 */
interface GenerarResp {
  ok: boolean;
  area?: string;
  mesa?: string;
  sig?: string;
  path?: string;
  url?: string | null;
  error?: string;
}

@Component({
  selector: 'app-qr-generator',
  templateUrl: './qr-generator.component.html',
  styleUrls: ['./qr-generator.component.scss'],
  standalone: false,
})
export class QrGeneratorComponent {
  loading = false;
  error: string | null = null;
  resultado: GenerarResp | null = null;
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
  ) {
    // Form con valores iniciales y validaciones mínimas
    this.form = this.fb.group({
      area: ['interior', Validators.required],
      mesa: ['', Validators.required],
      baseUrl: [''],
    });
  }

  /**
   * Llama al endpoint del backend para generar el QR.
   * Muestra errores de red/autorización con mensajes amigables.
   */
  async generar(): Promise<void> {
    this.loading = true;
    this.error = null;
    this.resultado = null;

    const body = {
      area: this.form.value.area ?? '',
      mesa: this.form.value.mesa ?? '',
      baseUrl: this.form.value.baseUrl ?? '',
    };

    try {
      const resp = await firstValueFrom(this.http.post<GenerarResp>('/api/qr/generar.php', body));
      if (!resp?.ok) {
        this.error = resp?.error || 'No se pudo generar el QR';
      } else {
        this.resultado = resp;
      }
    } catch (e: any) {
      // Mensajes amigables según status
      if (e?.status === 401) {
        this.error =
          'No autorizado. Iniciá sesión como admin o habilitá el modo público en el backend.';
      } else if (e?.status === 403) {
        this.error = 'Permiso insuficiente. Se requiere rol admin/mozo.';
      } else if (e?.status === 0) {
        this.error = 'No se pudo contactar al servidor.';
      } else {
        this.error = 'Error del servidor al generar el QR';
      }
    } finally {
      this.loading = false;
    }
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
