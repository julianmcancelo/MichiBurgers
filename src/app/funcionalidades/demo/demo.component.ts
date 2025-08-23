import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, Subject, BehaviorSubject, interval } from 'rxjs';
import { takeUntil, map, startWith } from 'rxjs/operators';

import { LoggerService } from '../../core/services/logger.service';
import { HttpService } from '../../core/services/http.service';

/**
 * Componente de demostración que implementa TODOS los temas técnicos obligatorios
 * Este componente sirve como ejemplo completo para la presentación del examen
 */
@Component({
  selector: 'app-demo',
  templateUrl: './demo.component.html',
  styleUrls: ['./demo.component.scss'],
  standalone: false
})
export class DemoComponent implements OnInit, OnDestroy {
  // Formularios Reactivos
  demoForm!: FormGroup;
  
  // Programación Reactiva con RxJS
  private destroy$ = new Subject<void>();
  private dataSubject = new BehaviorSubject<any[]>([]);
  public data$ = this.dataSubject.asObservable();
  
  // Estados del componente
  loading = false;
  productos: any[] = [];
  filteredProductos$!: Observable<any[]>;
  
  // Datos para demostrar pipes
  precio = 1250.75;
  fechaCreacion = new Date();
  estadoMesa = 'ocupada';
  
  // Control de tiempo real
  tiempoTranscurrido$ = interval(1000).pipe(
    map(seconds => `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`)
  );

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private logger: LoggerService,
    private httpService: HttpService
  ) {
    this.initializeForm();
    this.setupReactiveSearch();
  }

  ngOnInit() {
    this.logger.info('DemoComponent inicializado');
    this.loadDemoData();
    this.startReactiveTimer();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Inicializa el formulario reactivo con validaciones
   */
  private initializeForm() {
    this.demoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      precio: [0, [Validators.required, Validators.min(0)]],
      categoria: ['', Validators.required],
      descripcion: [''],
      activo: [true],
      busqueda: ['']
    });
  }

  /**
   * Configura búsqueda reactiva usando RxJS
   */
  private setupReactiveSearch() {
    this.filteredProductos$ = this.demoForm.get('busqueda')!.valueChanges.pipe(
      startWith(''),
      map(searchTerm => this.filterProductos(searchTerm)),
      takeUntil(this.destroy$)
    );
  }

  /**
   * Carga datos de demostración usando HTTP Service
   */
  private loadDemoData() {
    this.loading = true;
    
    // Simular datos para demostración
    const mockData = [
      { id: 1, nombre: 'Hamburguesa Clásica', precio: 850, categoria: 'Hamburguesas', activo: true },
      { id: 2, nombre: 'Pizza Margherita', precio: 1200, categoria: 'Pizzas', activo: true },
      { id: 3, nombre: 'Ensalada César', precio: 750, categoria: 'Ensaladas', activo: false },
      { id: 4, nombre: 'Papas Fritas', precio: 450, categoria: 'Acompañamientos', activo: true }
    ];
    
    // Simular llamada HTTP con delay
    setTimeout(() => {
      this.productos = mockData;
      this.dataSubject.next(mockData);
      this.loading = false;
      this.logger.info('Datos de demostración cargados', mockData);
    }, 1500);
  }

  /**
   * Inicia timer reactivo para demostrar observables
   */
  private startReactiveTimer() {
    this.tiempoTranscurrido$
      .pipe(takeUntil(this.destroy$))
      .subscribe(tiempo => {
        this.logger.debug('Tiempo transcurrido:', tiempo);
      });
  }

  /**
   * Filtra productos basado en término de búsqueda
   */
  private filterProductos(searchTerm: string): any[] {
    if (!searchTerm) return this.productos;
    
    return this.productos.filter(producto =>
      producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      producto.categoria.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  /**
   * Maneja el envío del formulario reactivo
   */
  onSubmit() {
    if (this.demoForm.valid) {
      this.loading = true;
      const formData = this.demoForm.value;
      
      this.logger.info('Formulario enviado', formData);
      
      // Simular envío HTTP
      setTimeout(() => {
        this.loading = false;
        this.snackBar.open('Datos guardados correctamente', 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        
        // Agregar nuevo item a la lista reactiva
        const newItem = {
          id: this.productos.length + 1,
          ...formData
        };
        
        this.productos.push(newItem);
        this.dataSubject.next([...this.productos]);
        
        // Reset form
        this.demoForm.reset();
        this.demoForm.patchValue({ activo: true });
      }, 2000);
    } else {
      this.demoForm.markAllAsTouched();
      this.snackBar.open('Por favor complete todos los campos requeridos', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }

  /**
   * Elimina un producto de la lista
   */
  eliminarProducto(id: number) {
    this.productos = this.productos.filter(p => p.id !== id);
    this.dataSubject.next([...this.productos]);
    
    this.snackBar.open('Producto eliminado', 'Deshacer', {
      duration: 3000
    }).onAction().subscribe(() => {
      // Lógica para deshacer eliminación
      this.loadDemoData();
    });
  }

  /**
   * Cambia el estado de un producto
   */
  toggleProductoActivo(producto: any) {
    producto.activo = !producto.activo;
    this.dataSubject.next([...this.productos]);
    
    const estado = producto.activo ? 'activado' : 'desactivado';
    this.snackBar.open(`Producto ${estado}`, 'Cerrar', { duration: 2000 });
  }

  /**
   * Obtiene error de validación para un campo
   */
  getFieldError(fieldName: string): string {
    const field = this.demoForm.get(fieldName);
    
    if (field?.hasError('required')) {
      return `${fieldName} es requerido`;
    }
    
    if (field?.hasError('email')) {
      return 'Email inválido';
    }
    
    if (field?.hasError('minlength')) {
      return `${fieldName} debe tener al menos ${field.errors?.['minlength'].requiredLength} caracteres`;
    }
    
    if (field?.hasError('min')) {
      return `${fieldName} debe ser mayor a ${field.errors?.['min'].min}`;
    }
    
    return '';
  }

  /**
   * Verifica si un campo tiene errores
   */
  hasFieldError(fieldName: string): boolean {
    const field = this.demoForm.get(fieldName);
    return !!(field?.invalid && (field?.dirty || field?.touched));
  }

  /**
   * Simula carga de datos desde API
   */
  recargarDatos() {
    this.loadDemoData();
  }

  /**
   * Exporta datos (demostración)
   */
  exportarDatos() {
    const dataStr = JSON.stringify(this.productos, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'productos-demo.json';
    link.click();
    
    this.snackBar.open('Datos exportados correctamente', 'Cerrar', { duration: 2000 });
  }

  /**
   * TrackBy function para optimizar renderizado de listas
   */
  trackByProducto(index: number, producto: any): number {
    return producto.id;
  }
}
