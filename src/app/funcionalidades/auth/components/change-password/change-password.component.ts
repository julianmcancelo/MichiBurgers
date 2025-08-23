import { CommonModule } from '@angular/common';
import { Component, Optional } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';

import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-change-password',
  standalone: false,
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
})
export class ChangePasswordComponent {
  form: FormGroup;
  loading = false;
  error: string | null = null;
  ok = false;
  // UI
  hideCurrent = true;
  hideNext = true;
  hideConfirm = true;
  capsCurrent = false;
  capsNext = false;
  capsConfirm = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    @Optional() private dialogRef?: MatDialogRef<ChangePasswordComponent>,
  ) {
    this.form = this.fb.group({
      current: ['', [Validators.required, Validators.minLength(4)]],
      next: ['', [Validators.required, Validators.minLength(6)]],
      confirm: ['', [Validators.required]],
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
        // Si estamos dentro de un diálogo, cerrarlo tras éxito
        setTimeout(() => this.close(), 600);
      },
      error: (e) => {
        this.loading = false;
        this.error = e?.error?.error || 'No se pudo cambiar la contraseña';
      },
    });
  }

  onPassKey(field: 'current' | 'next' | 'confirm', event: KeyboardEvent): void {
    const state = (event as any)?.getModifierState?.('CapsLock');
    const on = !!state;
    if (field === 'current') this.capsCurrent = on;
    if (field === 'next') this.capsNext = on;
    if (field === 'confirm') this.capsConfirm = on;
  }

  onPassBlur(field: 'current' | 'next' | 'confirm'): void {
    if (field === 'current') this.capsCurrent = false;
    if (field === 'next') this.capsNext = false;
    if (field === 'confirm') this.capsConfirm = false;
  }

  close(): void {
    try {
      if (this.dialogRef) {
        this.dialogRef.close();
      }
    } catch {}
  }
}
