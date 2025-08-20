import { Component } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
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
  ],
  templateUrl: './registro-usuario.component.html',
  styleUrls: ['./registro-usuario.component.scss']
})
export class RegistroUsuarioComponent {
  cargando = false;
  roles = [
    { value: 'admin', label: 'Administrador' },
    { value: 'mozo', label: 'Mozo' },
    { value: 'cocina', label: 'Cocina' },
    { value: 'caja', label: 'Caja' }
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
    this.cargando = true;
    const body = this.form.value;
    // Usamos ruta relativa al dominio para funcionar en hosting
    this.http.post('/api/auth/register.php', body).subscribe({
      next: () => {
        this.cargando = false;
        this.snack.open('Usuario creado', 'OK', { duration: 2500 });
        this.router.navigate(['/admin']);
      },
      error: (err) => {
        this.cargando = false;
        const msg = err?.error?.error || 'No se pudo crear el usuario';
        this.snack.open(msg, 'Cerrar', { duration: 3500 });
      }
    });
  }
}
