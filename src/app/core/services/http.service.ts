import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models';
import { ErrorHandlerService } from './error-handler.service';
import { LoggerService } from './logger.service';

/**
 * Servicio HTTP centralizado para comunicación con la API
 * Proporciona métodos estandarizados para operaciones CRUD
 */
@Injectable({
  providedIn: 'root'
})
export class HttpService {
  private readonly baseUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService,
    private logger: LoggerService
  ) {}

  /**
   * Realiza una petición GET
   */
  get<T>(endpoint: string, params?: any): Observable<ApiResponse<T>> {
    const url = `${this.baseUrl}/${endpoint}`;
    const httpParams = this.buildParams(params);
    
    this.logger.info(`GET Request to: ${url}`, params);
    
    return this.http.get<ApiResponse<T>>(url, { params: httpParams })
      .pipe(
        catchError(error => this.errorHandler.handleHttpError(error))
      );
  }

  /**
   * Realiza una petición POST
   */
  post<T>(endpoint: string, data: any): Observable<ApiResponse<T>> {
    const url = `${this.baseUrl}/${endpoint}`;
    
    this.logger.info(`POST Request to: ${url}`, data);
    
    return this.http.post<ApiResponse<T>>(url, data, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => this.errorHandler.handleHttpError(error))
    );
  }

  /**
   * Realiza una petición PUT
   */
  put<T>(endpoint: string, data: any): Observable<ApiResponse<T>> {
    const url = `${this.baseUrl}/${endpoint}`;
    
    this.logger.info(`PUT Request to: ${url}`, data);
    
    return this.http.put<ApiResponse<T>>(url, data, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => this.errorHandler.handleHttpError(error))
    );
  }

  /**
   * Realiza una petición DELETE
   */
  delete<T>(endpoint: string): Observable<ApiResponse<T>> {
    const url = `${this.baseUrl}/${endpoint}`;
    
    this.logger.info(`DELETE Request to: ${url}`);
    
    return this.http.delete<ApiResponse<T>>(url, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => this.errorHandler.handleHttpError(error))
    );
  }

  /**
   * Construye HttpParams desde un objeto
   */
  private buildParams(params?: any): HttpParams {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }
    
    return httpParams;
  }

  /**
   * Obtiene headers estándar para las peticiones
   */
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
  }
}
