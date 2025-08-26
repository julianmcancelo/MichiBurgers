import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductosService, ProductoDTO } from '../../services/productos.service';

@Component({
  selector: 'app-formulario-producto',
  templateUrl: './formulario-producto.component.html',
  styleUrls: ['./formulario-producto.component.scss'],
  standalone: false,
})
export class FormularioProductoComponent implements OnInit {
  formularioProducto: FormGroup;
  esEdicion = false;
  idProducto: number | null = null;
  cargando = true;
  guardando = false;
  error: string | null = null;
  categorias: { id: number; nombre: string; orden: number }[] = [];
  previewUrl = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private productosSvc: ProductosService,
  ) {
    this.formularioProducto = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(120)]],
      categoria_id: [null, [Validators.required]],
      precio: [null, [Validators.required, Validators.min(0.01)]],
      descripcion: [''],
      imagen_url: [''],
      activo: [true, [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.idProducto = this.route.snapshot.params['id'];
    if (this.idProducto) {
      this.esEdicion = true;
      this.cargarDatos(this.idProducto);
    }
    if (!this.esEdicion) {
      this.cargarDatos();
    }
  }

  cargarDatos(id?: number): void {
    this.cargando = true;
    this.error = null;
    this.productosSvc.listar().subscribe({
      next: (resp) => {
        this.categorias = resp.categorias || [];
        if (id) {
          const producto = resp.productos.find((p) => p.id === +id);
          if (!producto) {
            this.error = 'Producto no encontrado';
          } else {
            this.rellenarFormulario(producto);
          }
        }
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar los datos';
        this.cargando = false;
      },
    });
  }

  private rellenarFormulario(producto: ProductoDTO): void {
    this.formularioProducto.patchValue({
      nombre: producto.nombre,
      categoria_id: producto.categoria_id,
      precio: producto.precio,
      descripcion: producto.descripcion ?? '',
      imagen_url: producto.imagen_url ?? '',
      activo: producto.activo === 1,
    });
    this.previewUrl = producto.imagen_url ?? '';
  }

  guardarProducto(): void {
    if (this.formularioProducto.invalid) return;
    this.guardando = true;
    const raw = this.formularioProducto.value as {
      categoria_id: number;
      nombre: string;
      precio: number;
      descripcion?: string;
      imagen_url?: string;
      activo: boolean;
    };
    const valores: Partial<ProductoDTO> & { categoria_id: number; nombre: string; precio: number } = {
      categoria_id: raw.categoria_id,
      nombre: raw.nombre,
      precio: raw.precio,
      descripcion: raw.descripcion ?? '',
      imagen_url: raw.imagen_url ?? '',
      activo: raw.activo ? 1 : 0,
    };
    if (this.esEdicion && this.idProducto) {
      this.productosSvc.actualizar(this.idProducto, valores).subscribe({
        next: () => this.router.navigate(['/admin/productos']),
        error: () => (this.guardando = false),
      });
    } else {
      this.productosSvc.crear(valores).subscribe({
        next: () => this.router.navigate(['/admin/productos']),
        error: () => (this.guardando = false),
      });
    }
  }

  cancelar(): void {
    this.router.navigate(['/admin/productos']);
  }

  obtenerErrorNombre(): string {
    const nombreControl = this.formularioProducto.get('nombre');
    if (nombreControl?.hasError('required')) {
      return 'El nombre es requerido';
    }
    return '';
  }

  obtenerErrorPrecio(): string {
    const precioControl = this.formularioProducto.get('precio');
    if (precioControl?.hasError('required')) {
      return 'El precio es requerido';
    }
    if (precioControl?.hasError('min')) {
      return 'El precio debe ser mayor a cero';
    }
    return '';
  }

  onImagenUrlChange(): void {
    const url = this.formularioProducto.get('imagen_url')?.value || '';
    this.previewUrl = url;
  }

  onPreviewError(ev: Event): void {
    const img = ev.target as HTMLImageElement | null;
    if (img && img.src !== '/favicon.ico') {
      img.src = '/favicon.ico';
    }
  }
}
