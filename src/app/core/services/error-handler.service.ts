import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { LoggerService } from './logger.service';

/**
 * Servicio centralizado para manejo de errores
 * Proporciona métodos consistentes para el tratamiento de errores en toda la aplicación
 */
@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService {
  constructor(private logger: LoggerService) {}

  /**
   * Maneja errores HTTP de forma centralizada
   * @param error Error HTTP recibido
   * @returns Observable con error formateado
   */
  handleHttpError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ha ocurrido un error inesperado';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
      this.logger.error('Error del cliente', error.error);
    } else {
      // Error del lado del servidor
      switch (error.status) {
        case 400:
          errorMessage = 'Solicitud incorrecta. Verifique los datos enviados.';
          break;
        case 401:
          errorMessage = 'No autorizado. Inicie sesión nuevamente.';
          break;
        case 403:
          errorMessage = 'Acceso denegado. No tiene permisos suficientes.';
          break;
        case 404:
          errorMessage = 'Recurso no encontrado.';
          break;
        case 500:
          errorMessage = 'Error interno del servidor. Intente nuevamente más tarde.';
          break;
        default:
          errorMessage = `Error del servidor: ${error.status} - ${error.message}`;
      }

      this.logger.error(`Error HTTP ${error.status}`, {
        status: error.status,
        message: error.message,
        url: error.url,
      });
    }

    return throwError(() => new Error(errorMessage));
  }

  /**
   * Maneja errores de validación de formularios
   * @param errors Objeto con errores de validación
   * @returns Array de mensajes de error formateados
   */
  handleValidationErrors(errors: any): string[] {
    const errorMessages: string[] = [];

    if (errors) {
      Object.keys(errors).forEach((field) => {
        const fieldErrors = errors[field];
        if (Array.isArray(fieldErrors)) {
          fieldErrors.forEach((error) => {
            errorMessages.push(`${field}: ${error}`);
          });
        } else {
          errorMessages.push(`${field}: ${fieldErrors}`);
        }
      });
    }

    this.logger.warn('Errores de validación', errors);
    return errorMessages;
  }

  /**
   * Maneja errores generales de la aplicación
   * @param error Error capturado
   * @param context Contexto donde ocurrió el error
   */
  handleGenericError(error: any, context: string = 'Aplicación'): void {
    const errorMessage = error?.message || 'Error desconocido';
    this.logger.error(`Error en ${context}`, {
      message: errorMessage,
      stack: error?.stack,
      context,
    });
  }
}
