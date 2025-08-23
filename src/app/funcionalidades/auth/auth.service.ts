import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';

import { LoginResponse, Usuario } from './models';

const BASE_URL = 'https://burguersaurio.jcancelo.dev/api';
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private usuarioSubject = new BehaviorSubject<Usuario | null>(this.cargarUsuarioLocal());
  usuario$ = this.usuarioSubject.asObservable();

  get token(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  }

  get usuario(): Usuario | null {
    return this.usuarioSubject.value;
  }

  login(legajo: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${BASE_URL}/auth/login.php`, { legajo, password }).pipe(
      tap((resp) => {
        this.guardarSesion(resp);
      }),
    );
  }

  me(): Observable<Usuario> {
    return this.http.get<Usuario>(`${BASE_URL}/auth/me.php`).pipe(tap((u) => this.setUsuario(u)));
  }

  changePassword(current: string, next: string): Observable<{ ok: boolean }> {
    return this.http.post<{ ok: boolean }>(`${BASE_URL}/auth/change-password.php`, {
      current,
      new: next,
    });
  }

  forgotPassword(legajo: string, dni: string, next: string): Observable<{ ok: boolean }> {
    return this.http.post<{ ok: boolean }>(`${BASE_URL}/auth/forgot-password.php`, {
      legajo,
      dni,
      new: next,
    });
  }

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
    this.usuarioSubject.next(null);
  }

  private guardarSesion(resp: LoginResponse) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, resp.token);
      localStorage.setItem(USER_KEY, JSON.stringify(resp.usuario));
    }
    this.usuarioSubject.next(resp.usuario);
  }

  private setUsuario(u: Usuario) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_KEY, JSON.stringify(u));
    }
    this.usuarioSubject.next(u);
  }

  private cargarUsuarioLocal(): Usuario | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as Usuario;
    } catch {
      return null;
    }
  }
}
