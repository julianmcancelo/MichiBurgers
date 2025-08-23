import { Component } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MapaMesesService } from '../../mapa-meses.service';
import { MapaMes } from '../../models';

@Component({
  selector: 'app-editar-mes',
  templateUrl: './editar-mes.component.html',
  styleUrls: ['./editar-mes.component.scss'],
  standalone: false,
})
export class EditarMesComponent {
  id: string | null = null;
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private srv: MapaMesesService,
  ) {
    this.id = this.route.snapshot.paramMap.get('id');

    this.form = this.fb.group({
      anio: [new Date().getFullYear(), [Validators.required]],
      mes: [
        new Date().getMonth() + 1,
        [Validators.required, Validators.min(1), Validators.max(12)],
      ],
      titulo: ['', [Validators.required, Validators.maxLength(100)]],
      notas: [''],
    });

    if (this.id) {
      const existente = this.srv.obtenerPorId(this.id);
      if (existente) {
        this.form.patchValue({
          anio: existente.anio,
          mes: existente.mes,
          titulo: existente.titulo,
          notas: existente.notas || '',
        });
      }
    }
  }

  guardar() {
    if (this.form.invalid) return;
    const val = this.form.value;
    const id = `${val.anio}-${String(val.mes).padStart(2, '0')}`;

    if (this.id) {
      this.srv.actualizar(this.id, {
        anio: val.anio!,
        mes: val.mes!,
        titulo: val.titulo!,
        notas: val.notas ?? '',
      } as Partial<MapaMes>);
    } else {
      this.srv.crear({
        id,
        anio: val.anio!,
        mes: val.mes!,
        titulo: val.titulo!,
        notas: val.notas ?? '',
        items: [],
      });
    }
    this.router.navigate(['/mapa-meses']);
  }

  cancelar() {
    this.router.navigate(['/mapa-meses']);
  }
}
