import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe personalizado para formatear moneda en pesos argentinos
 * Uso: {{ precio | currencyFormat }}
 */
@Pipe({
  name: 'currencyFormat',
  standalone: true
})
export class CurrencyFormatPipe implements PipeTransform {
  
  transform(value: number | string): string {
    if (value === null || value === undefined || value === '') {
      return '$0,00';
    }
    
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;
    
    if (isNaN(numericValue)) {
      return '$0,00';
    }
    
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numericValue);
  }
}
