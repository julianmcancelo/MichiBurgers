import { Component, OnDestroy, OnInit } from '@angular/core';
import { interval, Subject, takeUntil } from 'rxjs';

interface Pedido {
  id: number;
  mesaId: string;
  estado: 'tomado' | 'preparacion' | 'listo' | 'entregado';
  hora: string;
  horaListo?: string;
  horaEntregado?: string;
  items?: any[];
  tiempoPreparacion?: number; // en minutos
}

@Component({
  selector: 'app-estado-pedidos',
  templateUrl: './estado-pedidos.component.html',
  styleUrls: ['./estado-pedidos.component.scss'],
  standalone: false,
})
export class EstadoPedidosComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Listas de pedidos por estado
  pedidosTomados: Pedido[] = [];
  pedidosPreparacion: Pedido[] = [];
  pedidosListos: Pedido[] = [];
  pedidosEntregados: Pedido[] = [];

  // Datos de ejemplo para demostración
  private pedidosEjemplo: Pedido[] = [
    {
      id: 101,
      mesaId: '5',
      estado: 'tomado',
      hora: '13:15:30',
      items: [{ nombre: 'Burger Clásica' }, { nombre: 'Papas Fritas' }]
    },
    {
      id: 102,
      mesaId: '3',
      estado: 'preparacion',
      hora: '13:10:15',
      tiempoPreparacion: 8,
      items: [{ nombre: 'Burger Doble' }, { nombre: 'Coca Cola' }]
    },
    {
      id: 103,
      mesaId: '7',
      estado: 'listo',
      hora: '13:05:45',
      horaListo: '13:20:30',
      items: [{ nombre: 'Burger BBQ' }, { nombre: 'Papas' }, { nombre: 'Sprite' }]
    },
    {
      id: 100,
      mesaId: '2',
      estado: 'entregado',
      hora: '12:55:20',
      horaListo: '13:10:15',
      horaEntregado: '13:12:45',
      items: [{ nombre: 'Burger Veggie' }]
    }
  ];

  constructor() {}

  ngOnInit(): void {
    // Cargar datos iniciales
    this.cargarPedidos();
    
    // Actualizar cada 30 segundos
    interval(30000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.actualizarPedidos();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Método para el template
  getCurrentTime(): string {
    return new Date().toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  cargarPedidos(): void {
    // Separar pedidos por estado
    this.pedidosTomados = this.pedidosEjemplo.filter(p => p.estado === 'tomado');
    this.pedidosPreparacion = this.pedidosEjemplo.filter(p => p.estado === 'preparacion');
    this.pedidosListos = this.pedidosEjemplo.filter(p => p.estado === 'listo');
    this.pedidosEntregados = this.pedidosEjemplo.filter(p => p.estado === 'entregado');
  }

  actualizarPedidos(): void {
    // Aquí se conectaría con la API real
    console.log('Actualizando pedidos...');
    this.cargarPedidos();
  }

  cambiarEstado(pedido: Pedido, nuevoEstado: 'preparacion' | 'listo' | 'entregado'): void {
    const ahora = new Date().toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    // Actualizar el pedido
    pedido.estado = nuevoEstado;
    
    switch (nuevoEstado) {
      case 'preparacion':
        pedido.tiempoPreparacion = 0;
        break;
      case 'listo':
        pedido.horaListo = ahora;
        break;
      case 'entregado':
        pedido.horaEntregado = ahora;
        break;
    }

    // Reorganizar las listas
    this.cargarPedidos();
    
    console.log(`Pedido #${pedido.id} cambiado a estado: ${nuevoEstado}`);
  }

  getTiempoPreparacion(pedido: Pedido): string {
    if (!pedido.tiempoPreparacion && pedido.hora) {
      // Calcular tiempo transcurrido desde que se tomó el pedido
      const horaInicio = new Date();
      const [horas, minutos, segundos] = pedido.hora.split(':').map(Number);
      horaInicio.setHours(horas, minutos, segundos);
      
      const ahora = new Date();
      const diferencia = Math.floor((ahora.getTime() - horaInicio.getTime()) / 60000); // en minutos
      
      return `${diferencia} min`;
    }
    
    return `${pedido.tiempoPreparacion || 0} min`;
  }
}
