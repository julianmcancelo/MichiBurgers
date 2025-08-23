import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';

/**
 * Directiva para resaltar elementos al hacer hover
 * Uso: <div appHighlight [highlightColor]="'yellow'">Contenido</div>
 */
@Directive({
  selector: '[appHighlight]',
  standalone: true
})
export class HighlightDirective {
  @Input() highlightColor = '#ffeb3b';
  @Input() defaultColor = 'transparent';

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  @HostListener('mouseenter') onMouseEnter() {
    this.highlight(this.highlightColor);
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.highlight(this.defaultColor);
  }

  private highlight(color: string) {
    this.renderer.setStyle(this.el.nativeElement, 'backgroundColor', color);
    this.renderer.setStyle(this.el.nativeElement, 'transition', 'background-color 0.3s ease');
  }
}
