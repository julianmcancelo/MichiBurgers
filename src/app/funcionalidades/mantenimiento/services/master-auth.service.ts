import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, map, of, tap } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

const MASTER_TOKEN_KEY = 'master_token';

const API_BASE = 'https://burguersaurio.jcancelo.dev/api';

@Injectable({ providedIn: 'root' })
export class MasterAuthService {
  private router = inject(Router);
  private http = inject(HttpClient);
  private _authed$ = new BehaviorSubject<boolean>(this.hasToken());
  authed$ = this._authed$.asObservable();

  private hasToken(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      return !!localStorage.getItem(MASTER_TOKEN_KEY);
    } catch {
      return false;
    }
  }

  get isAuthenticated(): boolean {
    return this._authed$.value;
  }

  get token(): string | null {
    if (typeof window === 'undefined') return null;
    try { return localStorage.getItem(MASTER_TOKEN_KEY); } catch { return null; }
  }

  login(password: string): Observable<boolean> {
    return this.http.post<{ token: string }>(`${API_BASE}/auth/master-login.php`, { password }).pipe(
      tap((resp) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem(MASTER_TOKEN_KEY, resp.token);
        }
        this._authed$.next(true);
      }),
      map(() => true)
    );
  }

  logout(): void {
    if (typeof window === 'undefined') return;
    try { localStorage.removeItem(MASTER_TOKEN_KEY); } catch {}
    this._authed$.next(false);
    this.router.navigate(['/mantenimiento/ingresar']);
  }

  private authHeaders(): HttpHeaders {
    const t = this.token || '';
    return new HttpHeaders({ Authorization: `Bearer ${t}` });
  }

  getConfig(): Observable<any> {
    return this.http.get(`${API_BASE}/config/app.php`, { headers: this.authHeaders() });
  }

  saveConfig(cfg: any): Observable<any> {
    return this.http.post(`${API_BASE}/config/app.php`, cfg, { headers: this.authHeaders() });
  }
}
