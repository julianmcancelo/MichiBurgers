import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-formulario-producto',
  templateUrl: './formulario-producto.component.html',
  styleUrls: ['./formulario-producto.component.scss'],
  standalone: false
})
export class FormularioProductoComponent implements OnInit {
  formularioProducto: FormGroup;
  esEdicion = false;
  idProducto: number | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.formularioProducto = this.fb.group({
      nombre: ['', [Validators.required]],
      precio: ['', [Validators.required, Validators.min(0.01)]]
    });
  }

  ngOnInit(): void {
    this.idProducto = this.route.snapshot.params['id'];
    if (this.idProducto) {
      this.esEdicion = true;
      this.cargarProducto(this.idProducto);
    }
  }

  cargarProducto(id: number): void {
    // Simulamos la carga de datos del producto
    const productosEjemplo = [
      { id: 1, nombre: 'Hamburguesa Clásica', precio: 8500 },
      { id: 2, nombre: 'Hamburguesa BBQ', precio: 9500 },
      { id: 3, nombre: 'Hamburguesa Vegetariana', precio: 8000 }
    ];

    const producto = productosEjemplo.find(p => p.id === +id);
    if (producto) {
      this.formularioProducto.patchValue({
        nombre: producto.nombre,
        precio: producto.precio
      });
    }
  }

  guardarProducto(): void {
    if (this.formularioProducto.valid) {
      const datosProducto = this.formularioProducto.value;
      
      if (this.esEdicion) {
        console.log('Editando producto:', { id: this.idProducto, ...datosProducto });
      } else {
        console.log('Creando nuevo producto:', datosProducto);
      }
      
      this.router.navigate(['/admin']);
    } else {
      console.log('Formulario inválido');
    }
  }

  cancelar(): void {
    this.router.navigate(['/admin']);
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
}
