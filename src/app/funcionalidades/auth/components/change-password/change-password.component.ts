import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-change-password',
  standalone: false,
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent {
  form: FormGroup;
  loading = false;
  error: string | null = null;
  ok = false;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      current: ['', [Validators.required, Validators.minLength(4)]],
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
    this.auth.changePassword(this.form.value.current, this.form.value.next).subscribe({
      next: () => {
        this.loading = false;
        this.ok = true;
        // Opcional: desloguear tras cambiar
        // this.auth.logout();
        // this.router.navigate(['/auth/login']);
      },
      error: (e) => {
        this.loading = false;
        this.error = e?.error?.error || 'No se pudo cambiar la contraseña';
      }
    });
  }
}
