import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe para formatear el estado de las mesas con colores y texto apropiado
 * Uso: {{ estadoMesa | estadoMesa }}
 */
@Pipe({
  name: 'estadoMesa',
  standalone: true
})
export class EstadoMesaPipe implements PipeTransform {
  
  transform(value: string): { text: string; color: string; icon: string } {
    switch (value?.toLowerCase()) {
      case 'libre':
        return {
          text: 'Libre',
          color: 'success',
          icon: 'check_circle'
        };
      case 'ocupada':
        return {
          text: 'Ocupada',
          color: 'warn',
          icon: 'people'
        };
      case 'reservada':
        return {
          text: 'Reservada',
          color: 'accent',
          icon: 'event'
        };
      case 'mantenimiento':
        return {
          text: 'Mantenimiento',
          color: 'primary',
          icon: 'build'
        };
      default:
        return {
          text: 'Desconocido',
          color: 'basic',
          icon: 'help'
        };
    }
  }
}
