import { Component, Optional } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '../../auth.service';

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
  // UI
  hideNext = true;
  hideConfirm = true;
  capsNext = false;
  capsConfirm = false;

  constructor(private fb: FormBuilder, private auth: AuthService, @Optional() private dialogRef?: MatDialogRef<ForgotPasswordComponent>) {
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
        setTimeout(() => this.close(), 600);
      },
      error: (e) => {
        this.loading = false;
        this.error = e?.error?.error || 'No se pudo recuperar la contraseña';
      }
    });
  }

  onPassKey(field: 'next' | 'confirm', event: KeyboardEvent): void {
    const state = (event as any)?.getModifierState?.('CapsLock');
    const on = !!state;
    if (field === 'next') this.capsNext = on;
    if (field === 'confirm') this.capsConfirm = on;
  }

  onPassBlur(field: 'next' | 'confirm'): void {
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
