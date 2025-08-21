import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: false,
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  form: FormGroup;
  loading = false;
  error: string | null = null;
  ok = false;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      legajo: ['', [Validators.required]],
      dni: ['', [Validators.required, Validators.minLength(6)]],
      next: ['', [Validators.required, Validators.minLength(6)]],
      confirm: ['', [Validators.required]]
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.form.value.next !== this.form.value.confirm) {
      this.error = 'Las contraseñas nuevas no coinciden';
      return;
    }
    this.loading = true;
    this.error = null;
    this.auth.forgotPassword(this.form.value.legajo, this.form.value.dni, this.form.value.next).subscribe({
      next: () => {
        this.loading = false;
        this.ok = true;
      },
      error: (e) => {
        this.loading = false;
        this.error = e?.error?.error || 'No se pudo recuperar la contraseña';
      }
    });
  }
}
