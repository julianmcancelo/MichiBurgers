import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, Validators } from '@angular/forms';
import { MasterAuthService } from '../../services/master-auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-master',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './login-master.component.html',
  styleUrls: ['./login-master.component.scss']
})
export class LoginMasterComponent {
  loading = false;
  error: string | null = null;
  form!: FormGroup;

  constructor(private fb: FormBuilder, private master: MasterAuthService, private router: Router) {
    this.form = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  ingresar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const pwd = this.form.value.password || '';
    this.loading = true;
    this.error = null;
    this.master.login(pwd).subscribe((ok: boolean) => {
      this.loading = false;
      if (ok) this.router.navigate(['/mantenimiento/panel']);
      else this.error = 'Contraseña inválida';
    });
  }
}
