import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  const cloned = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;
  const router = inject(Router);

  return next(cloned).pipe(
    catchError(err => {
      if (err?.status === 401) {
        // token inválido/expirado
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
        }
        router.navigateByUrl('/auth/login');
      }
      return throwError(() => err);
    })
  );
};
