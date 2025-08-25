import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { MapaMesesService } from '../../mapa-meses.service';
import { MapaMes } from '../../models';

@Component({
  selector: 'app-lista-meses',
  templateUrl: './lista-meses.component.html',
  styleUrls: ['./lista-meses.component.scss'],
  standalone: false,
})
export class ListaMesesComponent implements OnInit {
  dataSource = { data: [] as MapaMes[] };
  datosOriginales: MapaMes[] = [];

  // Filtros
  filtroAnio: number | null = null;
  filtroMes: number | null = null;

  
  constructor(
    private srv: MapaMesesService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.datosOriginales = this.srv.obtenerTodos();
    this.aplicarFiltro();
  }

  
  crear() {
    this.router.navigate(['/mapa-meses/nuevo']);
  }
  editar(row: MapaMes) {
    this.router.navigate(['/mapa-meses/editar', row.id]);
  }
  eliminar(row: MapaMes) {
    this.srv.eliminar(row.id);
    this.datosOriginales = this.srv.obtenerTodos();
    this.aplicarFiltro();
  }

  aplicarFiltro() {
    let datosFiltrados = [...this.datosOriginales];

    if (this.filtroAnio) {
      datosFiltrados = datosFiltrados.filter(item => item.anio === this.filtroAnio);
    }

    if (this.filtroMes) {
      datosFiltrados = datosFiltrados.filter(item => item.mes === this.filtroMes);
    }

    this.dataSource.data = datosFiltrados;
  }

  limpiarFiltros() {
    this.filtroAnio = null;
    this.filtroMes = null;
    this.aplicarFiltro();
  }
}
