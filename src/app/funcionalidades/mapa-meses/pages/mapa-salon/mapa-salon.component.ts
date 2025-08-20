import { Component, OnInit, Optional } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, debounceTime } from 'rxjs';
import { MapaSalonApiService } from '../../services/mapa-salon-api.service';
import { CdkDragEnd } from '@angular/cdk/drag-drop';

interface Mesa {
  id: string;
  nombre: string;
  capacidad: number;
  x: number; // px
  y: number; // px
  forma: 'redonda' | 'cuadrada' | 'rectangular' | 'dinosaurio';
  ancho?: number; // px (solo para rectangular/cuadrada)
  alto?: number;  // px (solo para rectangular)
  color?: string;
  rotationDeg?: number; // rotación para cuadrada/rectangular
  area?: 'interior' | 'exterior';
}

const STORAGE_KEY = 'mapaSalonMesas';
const PREFS_KEY = 'mapaSalonPrefs';
const DRAW_KEY = 'mapaSalonAnotaciones';

interface Anotacion {
  area: 'interior' | 'exterior';
  d: string; // SVG path data
  color: string;
  width: number;
}

@Component({
  selector: 'app-mapa-salon',
  templateUrl: './mapa-salon.component.html',
  styleUrls: ['./mapa-salon.component.scss'],
  standalone: false
})
export class MapaSalonComponent implements OnInit {
  ancho = 900;
  alto = 600;

  mesas: Mesa[] = [];
  seleccionada: Mesa | null = null;
  // Snap a grilla
  snapToGrid = true;
  gridSize = 20;
  // Áreas y permisos
  areaActiva: 'interior' | 'exterior' = 'interior';
  permitirEditarExterior = false;

  private saveTrigger$ = new Subject<void>();

  get mesasArea(): Mesa[] {
    const area = this.areaActiva;
    return this.mesas.filter(m => (m.area || 'interior') === area);
  }

  // Dibujo / anotaciones
  modo: 'seleccion' | 'dibujo' = 'seleccion';
  brushColor = '#ff1744';
  brushWidth = 4;
  anotaciones: Anotacion[] = [];
  get anotacionesArea(): Anotacion[] {
    return this.anotaciones.filter(a => a.area === this.areaActiva);
  }
  dibujoEnCurso: string | null = null;

  constructor(@Optional() private route: ActivatedRoute, private api: MapaSalonApiService) {}

  ngOnInit(): void {
    // Cargar preferencias guardadas
    const prefs = this.cargarPrefs();
    if (prefs) {
      this.areaActiva = prefs.areaActiva ?? this.areaActiva;
      this.permitirEditarExterior = prefs.permitirEditarExterior ?? this.permitirEditarExterior;
    }


    // Leer query params si hay ActivatedRoute disponible
    if (this.route?.queryParamMap) {
      this.route.queryParamMap.subscribe((params) => {
        const area = params.get('area');
        if (area === 'interior' || area === 'exterior') {
          this.areaActiva = area;
        }
        const permitirExt = params.get('permitirExterior');
        if (permitirExt !== null) {
          const val = permitirExt.toLowerCase();
          this.permitirEditarExterior = val === '1' || val === 'true' || val === 'si' || val === 'sí';
        }
        this.guardarPrefs();
        // Cargar desde API para el área actual
        this.cargarDesdeApi(this.areaActiva);
      });
    } else {
      // Sin router (SSR/uso directo), igual cargar desde API
      this.cargarDesdeApi(this.areaActiva);
    }

    // Seed inicial desde localStorage
    this.mesas = this.cargar();
    this.anotaciones = this.cargarAnotaciones();
    // También cargar desde API por primera vez
    this.cargarDesdeApi(this.areaActiva);

    // Debounce de guardado a API
    this.saveTrigger$.pipe(debounceTime(500)).subscribe(() => {
      const area = this.areaActiva;
      const mesasArea = this.mesas.filter(m => (m.area || 'interior') === area);
      this.api.saveLayout(area, mesasArea).subscribe({
        next: () => {},
        error: () => {
          // Si falla, mantenemos localStorage como fallback
        }
      });
    });
  }

  private cargar(): Mesa[] {
    if (typeof window !== 'undefined' && 'localStorage' in window) {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw) as Mesa[];
      } catch {}
    }
    // Datos de ejemplo iniciales
    return [
      { id: 'M1', nombre: 'Mesa 1', capacidad: 4, x: 40, y: 40, forma: 'cuadrada', ancho: 120, alto: 90, color: '#ffffff', rotationDeg: 0, area: 'interior' },
      { id: 'M2', nombre: 'Mesa 2', capacidad: 2, x: 220, y: 120, forma: 'redonda', ancho: 100, alto: 100, color: '#ffffff', rotationDeg: 0, area: 'interior' },
      { id: 'M3', nombre: 'Mesa 3', capacidad: 6, x: 380, y: 240, forma: 'rectangular', ancho: 160, alto: 90, color: '#ffffff', rotationDeg: 0, area: 'exterior' }
    ];
  }

  private guardar() {
    if (typeof window !== 'undefined' && 'localStorage' in window) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.mesas));
    }
  }

  onDragEnded(ev: CdkDragEnd, mesa: Mesa) {
    if (!this.puedeEditarMesa(mesa)) return;
    const pos = ev.source.getFreeDragPosition();
    // Dimensiones reales según forma
    const w = mesa.ancho || (mesa.forma === 'redonda' ? 100 : 120);
    const h = mesa.alto || (mesa.forma === 'redonda' ? (mesa.ancho || 100) : 90);
    // Limitar dentro del contenedor
    const maxX = this.ancho - w;
    const maxY = this.alto - h;
    let x = Math.max(0, Math.min(pos.x, maxX));
    let y = Math.max(0, Math.min(pos.y, maxY));
    // Snap a grilla
    if (this.snapToGrid && this.gridSize > 1) {
      const gs = this.gridSize;
      x = Math.round(x / gs) * gs;
      y = Math.round(y / gs) * gs;
    }
    mesa.x = x;
    mesa.y = y;
    this.guardar();
    this.saveTrigger$.next();
  }

  puedeEditarMesa(m: Mesa): boolean {
    const area = m.area || 'interior';
    if (area === 'exterior' && !this.permitirEditarExterior) return false;
    // Solo se edita la mesa del área activa
    return this.areaActiva === area;
  }

  agregarMesa() {
    const n = this.mesas.length + 1;
    const nueva: Mesa = {
      id: `M${n}`,
      nombre: `Mesa ${n}`,
      capacidad: 4,
      x: 20 * n,
      y: 20 * n,
      forma: 'cuadrada',
      ancho: 120,
      alto: 90,
      color: '#ffffff',
      rotationDeg: 0,
      area: this.areaActiva
    };
    this.mesas = [...this.mesas, nueva];
    this.guardar();
  }

  eliminarMesa(id: string) {
    this.mesas = this.mesas.filter(m => m.id !== id);
    this.guardar();
    if (this.seleccionada?.id === id) this.seleccionada = null;
    this.saveTrigger$.next();
  }

  resetearMapa() {
    if (typeof window !== 'undefined' && 'localStorage' in window) {
      localStorage.removeItem(STORAGE_KEY);
    }
    this.mesas = this.cargar();
    this.seleccionada = null;
    this.cargarDesdeApi(this.areaActiva);
  }

  seleccionarMesa(m: Mesa) {
    if (!this.puedeEditarMesa(m)) return;
    this.seleccionada = m;
  }

  onCambio() {
    // Llamar cuando cambien inputs del panel
    this.guardar();
    this.guardarPrefs();
    this.saveTrigger$.next();
  }

  onCambioArea() {
    // Si la mesa seleccionada queda fuera de edición, deseleccionar
    if (this.seleccionada && !this.puedeEditarMesa(this.seleccionada)) {
      this.seleccionada = null;
    }
    this.guardar();
    this.guardarPrefs();
    // Cargar las mesas del área seleccionada desde la API
    this.cargarDesdeApi(this.areaActiva);
  }

  onCambioModo() {
    if (this.modo === 'dibujo') {
      // Evitar confusiones: si había una mesa seleccionada, deseleccionar
      this.seleccionada = null;
    }
  }

  private cargarPrefs(): { areaActiva?: 'interior' | 'exterior'; permitirEditarExterior?: boolean } | null {
    if (typeof window === 'undefined' || !('localStorage' in window)) return null;
    try {
      const raw = localStorage.getItem(PREFS_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  private guardarPrefs() {
    if (typeof window === 'undefined' || !('localStorage' in window)) return;
    try {
      const prefs = {
        areaActiva: this.areaActiva,
        permitirEditarExterior: this.permitirEditarExterior
      };
      localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    } catch {}
  }

  private cargarDesdeApi(area: 'interior' | 'exterior') {
    this.api.getLayout(area).subscribe({
      next: (mesasApi) => {
        if (!Array.isArray(mesasApi)) return;
        // Reemplazar solo las mesas del área indicada, mantener otras áreas
        const otras = this.mesas.filter(m => (m.area || 'interior') !== area);
        const normalizadas = (mesasApi as Mesa[]).map(m => ({ ...m, area: m.area || area }));
        this.mesas = [...otras, ...normalizadas];
        this.guardar(); // sincronizar cache local
      },
      error: () => {
        // Mantener lo local si falla
      }
    });
  }

  duplicarMesa(m: Mesa) {
    const copia: Mesa = { ...m, id: this.generarId(), nombre: `${m.nombre} (copia)`, x: m.x + 16, y: m.y + 16 };
    this.mesas = [...this.mesas, copia];
    this.guardar();
    this.saveTrigger$.next();
  }

  private generarId(): string {
    let i = this.mesas.length + 1;
    let id = `M${i}`;
    while (this.mesas.some(m => m.id === id)) {
      i++;
      id = `M${i}`;
    }
    return id;
  }

  // ======= Anotaciones: persistencia local =======
  private cargarAnotaciones(): Anotacion[] {
    if (typeof window !== 'undefined' && 'localStorage' in window) {
      try {
        const raw = localStorage.getItem(DRAW_KEY);
        if (raw) return JSON.parse(raw) as Anotacion[];
      } catch {}
    }
    return [];
  }

  private guardarAnotaciones() {
    if (typeof window !== 'undefined' && 'localStorage' in window) {
      localStorage.setItem(DRAW_KEY, JSON.stringify(this.anotaciones));
    }
  }

  borrarAnotacionesArea() {
    const area = this.areaActiva;
    this.anotaciones = this.anotaciones.filter(a => a.area !== area);
    this.guardarAnotaciones();
  }

  // ======= Anotaciones: eventos de dibujo =======
  onSvgDown(ev: MouseEvent) {
    if (this.modo !== 'dibujo') return;
    const { x, y } = this.xyDesdeEvento(ev);
    this.dibujoEnCurso = `M ${x} ${y}`;
  }

  onSvgMove(ev: MouseEvent) {
    if (this.modo !== 'dibujo' || !this.dibujoEnCurso) return;
    const { x, y } = this.xyDesdeEvento(ev);
    this.dibujoEnCurso += ` L ${x} ${y}`;
  }

  onSvgUp() {
    if (!this.dibujoEnCurso) return;
    this.anotaciones.push({
      area: this.areaActiva,
      d: this.dibujoEnCurso,
      color: this.brushColor,
      width: this.brushWidth,
    });
    this.dibujoEnCurso = null;
    this.guardarAnotaciones();
  }

  private xyDesdeEvento(ev: MouseEvent): { x: number; y: number } {
    const x = (ev as any).offsetX ?? ev.clientX;
    const y = (ev as any).offsetY ?? ev.clientY;
    const clampedX = Math.max(0, Math.min(this.ancho, x));
    const clampedY = Math.max(0, Math.min(this.alto, y));
    return { x: clampedX, y: clampedY };
  }
}
