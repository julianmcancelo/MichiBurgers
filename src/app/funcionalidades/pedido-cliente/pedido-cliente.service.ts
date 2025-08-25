import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface PedidoClienteState {
  area?: string;
  mesaId?: string;
  cliente?: { nombre: string; telefono: string };
  items: { [productoId: number]: { cantidad: number; nombre: string; precio: number } };
  total: number;
}

const initialState: PedidoClienteState = {
  items: {},
  total: 0,
};

@Injectable({
  providedIn: 'root',
})
export class PedidoClienteService {
  private readonly state = new BehaviorSubject<PedidoClienteState>(initialState);

  // Observable para que los componentes se suscriban a los cambios
  state$ = this.state.asObservable();

  setMesa(area: string, mesaId: string): void {
    const currentState = this.state.getValue();
    this.state.next({ ...currentState, area, mesaId });
  }

  setCliente(nombre: string, telefono: string): void {
    const currentState = this.state.getValue();
    this.state.next({ ...currentState, cliente: { nombre, telefono } });
  }

  agregarItem(producto: { id: number; nombre: string; precio: number }): void {
    const currentState = this.state.getValue();
    const items = { ...currentState.items };
    const existingItem = items[producto.id];

    if (existingItem) {
      items[producto.id] = { ...existingItem, cantidad: existingItem.cantidad + 1 };
    } else {
      items[producto.id] = { cantidad: 1, nombre: producto.nombre, precio: producto.precio };
    }

    this.state.next({ ...currentState, items, total: this.recalcularTotal(items) });
  }

  quitarItem(productoId: number): void {
    const currentState = this.state.getValue();
    const items = { ...currentState.items };
    const existingItem = items[productoId];

    if (existingItem && existingItem.cantidad > 1) {
      items[productoId] = { ...existingItem, cantidad: existingItem.cantidad - 1 };
    } else if (existingItem) {
      delete items[productoId];
    }

    this.state.next({ ...currentState, items, total: this.recalcularTotal(items) });
  }

  private recalcularTotal(items: PedidoClienteState['items']): number {
    return Object.values(items).reduce((total, item) => {
      return total + item.precio * item.cantidad;
    }, 0);
  }

  resetState(): void {
    this.state.next(initialState);
  }
}
