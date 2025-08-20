import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: false
})
export class LoginComponent {
  formularioLogin: FormGroup;
  hidePassword = true;
  cargando = false;
  errorLogin = false;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router, private snack: MatSnackBar) {
    this.formularioLogin = this.fb.group({
      legajo: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  iniciarSesion(): void {
    this.errorLogin = false;
    if (!this.formularioLogin.valid) {
      this.formularioLogin.markAllAsTouched();
      return;
    }
    this.cargando = true;
    const { legajo, password } = this.formularioLogin.value;
    this.auth.login(legajo, password).subscribe({
      next: (resp) => {
        this.cargando = false;
        const u = resp.usuario;
        this.snack.open(`Bienvenido, ${u.nombreCompleto}`, 'OK', { duration: 3000 });
        // Redirección por rol
        let destino = '/';
        switch (u.rol) {
          case 'admin': destino = '/admin'; break;
          case 'mozo': destino = '/comandera'; break;
          case 'cocina': destino = '/cocina'; break;
          case 'caja': destino = '/mapa-meses'; break;
        }
        this.router.navigateByUrl(destino);
      },
      error: () => {
        this.errorLogin = true;
        this.cargando = false;
      }
    });
  }

  obtenerErrorLegajo(): string {
    const c = this.formularioLogin.get('legajo');
    if (c?.hasError('required')) return 'El legajo es requerido';
    return '';
  }

  obtenerErrorPassword(): string {
    const passwordControl = this.formularioLogin.get('password');
    if (passwordControl?.hasError('required')) {
      return 'La contraseña es requerida';
    }
    return '';
  }
}
