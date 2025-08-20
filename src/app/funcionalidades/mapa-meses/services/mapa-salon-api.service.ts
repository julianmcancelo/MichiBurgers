import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';

// Ajustar si luego movemos a environments
const BASE_URL = 'https://burguersaurio.jcancelo.dev/api';

@Injectable({ providedIn: 'root' })
export class MapaSalonApiService {
  constructor(private http: HttpClient) {}

  getLayout(area: 'interior' | 'exterior'): Observable<any[]> {
    const params = new HttpParams().set('area', area);
    return this.http
      .get<{ area: string; data: any[]; updated_at?: string }>(`${BASE_URL}/layouts.php`, { params })
      .pipe(map((res) => res?.data ?? []));
  }

  saveLayout(area: 'interior' | 'exterior', mesas: any[]): Observable<boolean> {
    const params = new HttpParams().set('area', area);
    return this.http
      .put(`${BASE_URL}/layouts.php`, mesas, { params })
      .pipe(map(() => true));
  }
}
