import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatRipple } from '@angular/material/core';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { Area } from '../../models/area.model';
import { CalificacionService } from '../../services/calificacion.service';
import { CalificacionSessionService } from '../../services/calificacion-session.service';

@Component({
  selector: 'app-area-selection',
  templateUrl: './area-selection.component.html',
  styleUrls: ['./area-selection.component.scss'],
  imports: [MatRipple, MatIcon, MatButton]
})
export class AreaSelectionComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly api = inject(CalificacionService);
  private readonly session = inject(CalificacionSessionService);
  private readonly destroyRef = inject(DestroyRef);

  areas: Area[] = [];
  selectedArea: Area | null = null;
  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    const pendiente = this.session.obtenerPendiente();
    if (pendiente) {
      void this.router.navigate(['/calificacion'], {
        queryParams: { areaId: pendiente.area_id }, replaceUrl: true
      });
      return;
    }
    this.cargarAreas();
  }

  cargarAreas(): void {
    if (this.isLoading) return;
    this.isLoading = true;
    this.errorMessage = '';
    this.selectedArea = null;
    this.areas = [];
    this.api.obtenerAreas().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: areas => {
        this.areas = areas;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'No pudimos cargar las áreas. Revisa tu conexión y vuelve a intentarlo.';
      }
    });
  }

  goBack(): void {
    void this.router.navigate(['/bienvenida']);
  }

  selectArea(area: Area): void {
    this.selectedArea = area;
  }

  onSiguiente(): void {
    if (this.selectedArea && !this.isLoading) {
      void this.router.navigate(['/calificacion'], {
        queryParams: { areaId: this.selectedArea.id }
      });
    }
  }
}
