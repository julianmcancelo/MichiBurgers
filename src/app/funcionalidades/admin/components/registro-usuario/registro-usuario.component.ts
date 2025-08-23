import { Component, signal } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-registro-usuario',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSnackBarModule,
  ],
  templateUrl: './registro-usuario.component.html',
  styleUrls: ['./registro-usuario.component.scss'],
})
export class RegistroUsuarioComponent {
  cargando = signal(false);
  roles = [
    { value: 'admin', label: 'Administrador' },
    { value: 'mozo', label: 'Mozo' },
    { value: 'cocina', label: 'Cocina' },
    { value: 'caja', label: 'Caja' },
  ];
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private snack: MatSnackBar,
    private router: Router,
  ) {
    this.form = this.fb.group({
      legajo: ['', [Validators.required, Validators.maxLength(20)]],
      nombreCompleto: ['', [Validators.required, Validators.maxLength(120)]],
      dni: ['', [Validators.required, Validators.pattern(/^[0-9]{7,10}$/)]],
      rol: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  registrar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    // Evita NG0100 (ExpressionChangedAfterItHasBeenChecked) con zoneless/SSR
    queueMicrotask(() => {
      this.cargando.set(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') || '' : '';
      const body = { ...this.form.value, token } as const;
      // Usamos URL absoluta para apuntar explícitamente al backend
      this.http.post('https://burguersaurio.jcancelo.dev/api/auth/register.php', body).subscribe({
        next: () => {
          this.cargando.set(false);
          this.snack.open('Usuario creado', 'OK', { duration: 2500 });
          this.router.navigate(['/admin']);
        },
        error: (err) => {
          this.cargando.set(false);
          // Log completo para diagnóstico
          console.error('Registro de usuario falló:', err);
          // Extrae mensaje significativo según forma de respuesta
          let msg = 'No se pudo crear el usuario';
          if (typeof err?.error === 'string') {
            // Respuesta en texto/HTML
            msg = err.error.slice(0, 200);
          } else if (err?.error?.error) {
            msg = err.error.error;
          } else if (err?.status === 401) {
            msg = 'No autorizado. Iniciá sesión como administrador.';
          } else if (err?.status === 0) {
            msg = 'No hay conexión con el servidor.';
          }
          this.snack.open(msg, 'Cerrar', { duration: 4500 });
        },
      });
    });
  }
}
