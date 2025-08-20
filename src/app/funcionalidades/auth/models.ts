export type Rol = 'admin' | 'mozo' | 'cocina' | 'caja';

export interface Usuario {
  id?: number;
  legajo: string;
  nombreCompleto: string;
  dni: string;
  rol: Rol;
  token?: string;
}

export interface LoginResponse {
  token: string;
  usuario: Usuario;
}
