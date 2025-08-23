import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe para mostrar tiempo transcurrido desde una fecha
 * Uso: {{ fecha | timeAgo }}
 */
@Pipe({
  name: 'timeAgo',
  standalone: true
})
export class TimeAgoPipe implements PipeTransform {
  
  transform(value: string | Date): string {
    if (!value) return '';
    
    const date = typeof value === 'string' ? new Date(value) : value;
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInMinutes < 1) {
      return 'Ahora mismo';
    } else if (diffInMinutes < 60) {
      return `Hace ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`;
    } else if (diffInHours < 24) {
      return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    } else {
      return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
    }
  }
}
