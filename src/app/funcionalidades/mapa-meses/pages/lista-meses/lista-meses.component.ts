import { Component, OnInit, ViewChild } from '@angular/core';
import { MapaMesesService } from '../../mapa-meses.service';
import { MapaMes } from '../../models';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';

@Component({
  selector: 'app-lista-meses',
  templateUrl: './lista-meses.component.html',
  styleUrls: ['./lista-meses.component.scss'],
  standalone: false
})
export class ListaMesesComponent implements OnInit {
  columnas = ['anio', 'mes', 'titulo', 'acciones'];
  dataSource = new MatTableDataSource<MapaMes>([]);

  // Filtros
  filtroAnio: number | null = null;
  filtroMes: number | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private srv: MapaMesesService, private router: Router) {}

  ngOnInit(): void {
    this.dataSource.data = this.srv.obtenerTodos();

    // Predicado de filtrado por Año y Mes
    this.dataSource.filterPredicate = (data: MapaMes, filter: string) => {
      if (!filter) return true;
      const f = JSON.parse(filter) as { anio: number | null; mes: number | null };
      const okAnio = f.anio ? data.anio === f.anio : true;
      const okMes = f.mes ? data.mes === f.mes : true;
      return okAnio && okMes;
    };
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  crear() { this.router.navigate(['/mapa-meses/nuevo']); }
  editar(row: MapaMes) { this.router.navigate(['/mapa-meses/editar', row.id]); }
  eliminar(row: MapaMes) { this.srv.eliminar(row.id); this.dataSource.data = this.srv.obtenerTodos(); }

  aplicarFiltro() {
    const payload = { anio: this.filtroAnio, mes: this.filtroMes };
    this.dataSource.filter = JSON.stringify(payload);
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
  }

  limpiarFiltros() {
    this.filtroAnio = null;
    this.filtroMes = null;
    this.aplicarFiltro();
  }
}
