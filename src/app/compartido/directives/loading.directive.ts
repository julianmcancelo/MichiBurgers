import { Directive, ElementRef, Input, Renderer2, OnChanges } from '@angular/core';

/**
 * Directiva para mostrar estado de carga en elementos
 * Uso: <button appLoading [isLoading]="loading">Guardar</button>
 */
@Directive({
  selector: '[appLoading]',
  standalone: true
})
export class LoadingDirective implements OnChanges {
  @Input() isLoading = false;
  @Input() loadingText = 'Cargando...';

  private originalText: string = '';
  private spinner: HTMLElement | null = null;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {
    this.originalText = this.el.nativeElement.textContent || '';
  }

  ngOnChanges() {
    if (this.isLoading) {
      this.showLoading();
    } else {
      this.hideLoading();
    }
  }

  private showLoading() {
    // Deshabilitar elemento
    this.renderer.setProperty(this.el.nativeElement, 'disabled', true);
    
    // Crear spinner
    this.spinner = this.renderer.createElement('mat-spinner');
    this.renderer.setStyle(this.spinner, 'width', '16px');
    this.renderer.setStyle(this.spinner, 'height', '16px');
    this.renderer.setStyle(this.spinner, 'display', 'inline-block');
    this.renderer.setStyle(this.spinner, 'margin-right', '8px');
    
    // Limpiar contenido y agregar spinner + texto
    this.renderer.setProperty(this.el.nativeElement, 'innerHTML', '');
    this.renderer.appendChild(this.el.nativeElement, this.spinner);
    this.renderer.appendChild(
      this.el.nativeElement, 
      this.renderer.createText(this.loadingText)
    );
  }

  private hideLoading() {
    // Habilitar elemento
    this.renderer.setProperty(this.el.nativeElement, 'disabled', false);
    
    // Restaurar texto original
    this.renderer.setProperty(this.el.nativeElement, 'textContent', this.originalText);
    
    // Limpiar spinner
    if (this.spinner) {
      this.renderer.removeChild(this.el.nativeElement, this.spinner);
      this.spinner = null;
    }
  }
}
