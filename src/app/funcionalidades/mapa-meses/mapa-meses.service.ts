import { Injectable } from '@angular/core';
import { MapaMes } from './models';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MapaMesesService {
  private data: MapaMes[] = [
    {
      id: '2025-01',
      anio: 2025,
      mes: 1,
      titulo: 'Enero 2025',
      notas: 'Temporada alta',
      items: [
        { dia: 1, nombre: 'Feriado', tipo: 'admin' },
        { dia: 5, nombre: 'Mantención cocina', tipo: 'cocina' },
      ],
    },
  ];

  private subject = new BehaviorSubject<MapaMes[]>([...this.data]);
  lista$ = this.subject.asObservable();

  obtenerTodos(): MapaMes[] {
    return [...this.data];
  }

  obtenerPorId(id: string): MapaMes | undefined {
    return this.data.find((m) => m.id === id);
  }

  crear(mes: MapaMes) {
    this.data.push({ ...mes });
    this.subject.next([...this.data]);
  }

  actualizar(id: string, mes: Partial<MapaMes>) {
    const idx = this.data.findIndex((m) => m.id === id);
    if (idx >= 0) {
      this.data[idx] = { ...this.data[idx], ...mes } as MapaMes;
      this.subject.next([...this.data]);
    }
  }

  eliminar(id: string) {
    this.data = this.data.filter((m) => m.id !== id);
    this.subject.next([...this.data]);
  }
}
