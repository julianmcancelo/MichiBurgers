/**
 * Modelos e interfaces compartidas del sistema
 * Centraliza todas las definiciones de tipos TypeScript
 */

// Modelo base para entidades con ID
export interface BaseEntity {
  id: number;
  created_at?: string;
  updated_at?: string;
}

// Usuario del sistema
export interface User extends BaseEntity {
  username: string;
  email: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  is_active: boolean;
}

// Roles de usuario
export enum UserRole {
  ADMIN = 'admin',
  MESERO = 'mesero',
  COCINA = 'cocina',
  CAJA = 'caja',
}

// Mesa del restaurante
export interface Mesa extends BaseEntity {
  numero: number;
  capacidad: number;
  estado: EstadoMesa;
  mesero_id?: number;
  qr_code?: string;
}

// Estados de mesa
export enum EstadoMesa {
  LIBRE = 'libre',
  OCUPADA = 'ocupada',
  RESERVADA = 'reservada',
  MANTENIMIENTO = 'mantenimiento',
}

// Producto del menú
export interface Producto extends BaseEntity {
  nombre: string;
  descripcion: string;
  precio: number;
  categoria_id: number;
  imagen_url?: string;
  disponible: boolean;
  tiempo_preparacion: number; // en minutos
}

// Categoría de productos
export interface Categoria extends BaseEntity {
  nombre: string;
  descripcion?: string;
  orden: number;
  activa: boolean;
}

// Pedido/Comanda
export interface Pedido extends BaseEntity {
  mesa_id: number;
  mesero_id: number;
  estado: EstadoPedido;
  total: number;
  observaciones?: string;
  items: ItemPedido[];
}

// Estados de pedido
export enum EstadoPedido {
  PENDIENTE = 'pendiente',
  EN_PREPARACION = 'en_preparacion',
  LISTO = 'listo',
  ENTREGADO = 'entregado',
  CANCELADO = 'cancelado',
}

// Item individual del pedido
export interface ItemPedido extends BaseEntity {
  pedido_id: number;
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  observaciones?: string;
  producto?: Producto; // Para joins
}

// Respuesta de autenticación
export interface AuthResponse {
  token: string;
  user: User;
  expires_in: number;
}

// Respuesta estándar de la API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

// Filtros para listados
export interface ListFilter {
  page?: number;
  limit?: number;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// Respuesta paginada
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}
