import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

import { AuthService } from '../../auth.service';
import { ForgotPasswordComponent } from '../forgot-password/forgot-password.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: false,
})
export class LoginComponent {
  formularioLogin: FormGroup;
  hidePassword = true;
  cargando = false;
  errorLogin = false;
  capsOn = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private snack: MatSnackBar,
    private dialog: MatDialog,
  ) {
    this.formularioLogin = this.fb.group({
      legajo: ['', [Validators.required]],
      password: ['', [Validators.required]],
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
        // Redirección por rol - todos van a la raíz
        let destino = '/';
        this.router.navigateByUrl(destino);
      },
      error: () => {
        this.errorLogin = true;
        this.cargando = false;
      },
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

  onPasswordKey(event: KeyboardEvent): void {
    try {
      // getModifierState is not supported in some older browsers; guard safely
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const state = event?.getModifierState?.('CapsLock');
      this.capsOn = !!state;
    } catch {
      this.capsOn = false;
    }
  }

  onPasswordBlur(): void {
    // Ocultamos el aviso al salir del campo
    this.capsOn = false;
  }

  openForgotPassword(): void {
    this.dialog.open(ForgotPasswordComponent, {
      width: '560px',
      maxWidth: '95vw',
      panelClass: 'dialog-elevada',
      autoFocus: true,
      restoreFocus: true,
    });
  }
}
