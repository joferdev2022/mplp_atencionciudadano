import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

interface Area {
  id: number;
  nombre: string;
}

@Component({
  selector: 'app-area-selection',
  templateUrl: './area-selection.component.html',
  styleUrls: ['./area-selection.component.scss']
})
export class AreaSelectionComponent {

  areas: Area[] = [
    { id: 1, nombre: 'Mesa de Partes' },
    { id: 2, nombre: 'Caja' },
    { id: 3, nombre: 'Infraestructura' },
    { id: 4, nombre: 'Tránsito' },
  ];

  selectedArea: Area | null = null;

  constructor(
    private router: Router,
    private location: Location
  ) {}

  goBack(): void {
    this.location.back();
  }

  selectArea(area: Area): void {
    this.selectedArea = area;
  }

  onSiguiente(): void {
    if (this.selectedArea) {
      this.router.navigate(['/calificacion'], {
        queryParams: { area: this.selectedArea.nombre }
      });
    }
  }
}
