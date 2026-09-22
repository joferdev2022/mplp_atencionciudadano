import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AreaSelectionComponent } from './area-selection.component';
import { CalificacionService } from '../../services/calificacion.service';

describe('AreaSelectionComponent', () => {
  let fixture: ComponentFixture<AreaSelectionComponent>;
  let api: jasmine.SpyObj<CalificacionService>;
  let navigate: jasmine.Spy;

  beforeEach(() => {
    sessionStorage.removeItem('mplp.calificacion.pendiente.v1');
    api = jasmine.createSpyObj<CalificacionService>('CalificacionService', ['obtenerAreas']);
    TestBed.configureTestingModule({
      imports: [AreaSelectionComponent],
      providers: [provideRouter([]), { provide: CalificacionService, useValue: api }]
    });
    navigate = spyOn(TestBed.inject(Router), 'navigate').and.returnValue(Promise.resolve(true));
    fixture = TestBed.createComponent(AreaSelectionComponent);
  });

  it('permite reintentar la carga y navega usando el ID del catálogo', () => {
    api.obtenerAreas.and.returnValue(throwError(() => new Error('Sin conexión')));
    fixture.detectChanges();
    expect(fixture.componentInstance.errorMessage).toContain('No pudimos cargar');
    expect(fixture.componentInstance.areas).toEqual([]);

    const area = { id: 42, codigo: 'prueba', nombre: 'Área de prueba' };
    api.obtenerAreas.and.returnValue(of([area]));
    fixture.componentInstance.cargarAreas();
    fixture.componentInstance.selectArea(area);
    fixture.componentInstance.onSiguiente();
    expect(navigate).toHaveBeenCalledWith(['/calificacion'], { queryParams: { areaId: 42 } });
  });

  it('informa cuando no hay áreas activas', () => {
    api.obtenerAreas.and.returnValue(of([]));
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No hay áreas disponibles');
  });
});
