import { CommonModule } from '@angular/common';
import { Component, Inject, Optional } from '@angular/core';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { ProductosService, ProductoDTO, ListarResponse } from '../../services/productos.service';

interface NuevoProductoData {
  producto?: ProductoDTO | null;
}

@Component({
  selector: 'app-nuevo-producto-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatDialogModule,
  ],
  templateUrl: './nuevo-producto-dialog.component.html',
  styleUrls: ['./nuevo-producto-dialog.component.scss'],
})
export class NuevoProductoDialogComponent {
  form: FormGroup;
  loading = false;
  categorias: { id: number; nombre: string; orden: number }[] = [];
  isEdit = false;

  constructor(
    private fb: FormBuilder,
    private productos: ProductosService,
    @Optional() private dialogRef?: MatDialogRef<NuevoProductoDialogComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data?: NuevoProductoData,
  ) {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(255)]],
      categoria_id: [null as number | null, [Validators.required]],
      precio: [null as number | null, [Validators.required, Validators.min(0.01)]],
      descripcion: [''],
      imagen_url: [''],
      activo: [true],
    });
    this.cargarCategorias();

    if (data?.producto) {
      const p = data.producto;
      this.isEdit = true;
      this.form.patchValue({
        nombre: p.nombre,
        categoria_id: p.categoria_id,
        precio: p.precio,
        descripcion: p.descripcion ?? '',
        imagen_url: p.imagen_url ?? '',
        activo: !!p.activo,
      });
    }
  }

  private cargarCategorias(): void {
    this.productos.listar().subscribe({
      next: (resp: ListarResponse) => {
        this.categorias = resp.categorias || [];
      },
      error: () => {
        this.categorias = [];
      },
    });
  }

  cerrar(): void {
    this.dialogRef?.close();
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.value as Partial<ProductoDTO> & {
      categoria_id: number;
      nombre: string;
      precio: number;
    };
    this.loading = true;
    if (this.isEdit && this.data?.producto?.id) {
      this.productos.actualizar(this.data.producto.id, value).subscribe({
        next: () => {
          this.loading = false;
          this.dialogRef?.close({ ok: true, updated: true });
        },
        error: () => {
          this.loading = false;
        },
      });
    } else {
      this.productos.crear(value).subscribe({
        next: (res) => {
          this.loading = false;
          this.dialogRef?.close({ ok: true, id: res.id });
        },
        error: () => {
          this.loading = false;
        },
      });
    }
  }
}
