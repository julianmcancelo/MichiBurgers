import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

/**
 * Servicio de logging centralizado para la aplicación
 * Permite controlar los logs según el entorno (desarrollo/producción)
 */
@Injectable({
  providedIn: 'root',
})
export class LoggerService {
  /**
   * Log de información general
   * @param message Mensaje a registrar
   * @param data Datos adicionales opcionales
   */
  info(message: string, data?: any): void {
    if (environment.enableLogging) {
      console.log(`[INFO] ${new Date().toISOString()} - ${message}`, data || '');
    }
  }

  /**
   * Log de advertencias
   * @param message Mensaje de advertencia
   * @param data Datos adicionales opcionales
   */
  warn(message: string, data?: any): void {
    if (environment.enableLogging) {
      console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, data || '');
    }
  }

  /**
   * Log de errores
   * @param message Mensaje de error
   * @param error Error object o datos adicionales
   */
  error(message: string, error?: any): void {
    if (environment.enableLogging) {
      console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error || '');
    }
  }

  /**
   * Log de debug (solo en desarrollo)
   * @param message Mensaje de debug
   * @param data Datos adicionales opcionales
   */
  debug(message: string, data?: any): void {
    if (environment.enableLogging && !environment.production) {
      console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`, data || '');
    }
  }
}
