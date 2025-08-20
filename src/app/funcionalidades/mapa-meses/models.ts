export type TipoItem = 'cocina' | 'comandera' | 'admin';

export interface MapaMesItem {
  dia: number; // 1-31
  nombre: string;
  tipo: TipoItem;
}

export interface MapaMes {
  id: string;
  anio: number; // año
  mes: number; // 1-12
  titulo: string;
  notas?: string;
  items: MapaMesItem[];
}
