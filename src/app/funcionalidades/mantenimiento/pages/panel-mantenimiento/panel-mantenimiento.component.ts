import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MasterAuthService } from '../../services/master-auth.service';

@Component({
  selector: 'app-panel-mantenimiento',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './panel-mantenimiento.component.html',
  styleUrls: ['./panel-mantenimiento.component.scss'],
})
export class PanelMantenimientoComponent implements OnInit {
  // Formulario de configuración básica (placeholder)
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    public master: MasterAuthService,
  ) {
    this.form = this.fb.group({
      nombreEmprendimiento: ['', [Validators.required, Validators.maxLength(80)]],
      colorPrimario: ['#0b57d0'],
      colorSecundario: ['#00a36c'],
      apiBaseUrl: ['http://localhost:8080'],
    });
  }

  guardado = false;
  cargando = false;
  error: string | null = null;

  ngOnInit(): void {
    this.cargando = true;
    this.error = null;
    this.master.getConfig().subscribe({
      next: (cfg: any) => {
        this.cargando = false;
        if (cfg) this.form.patchValue(cfg);
      },
      error: () => {
        this.cargando = false;
        this.error = 'No se pudo cargar la configuración';
      },
    });
  }

  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.error = null;
    this.master.saveConfig(this.form.value).subscribe({
      next: () => {
        this.guardado = true;
        setTimeout(() => (this.guardado = false), 2000);
      },
      error: () => {
        this.error = 'No se pudo guardar la configuración';
      },
    });
  }
}
