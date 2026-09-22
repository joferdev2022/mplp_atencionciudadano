import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { RatingComponent } from './rating.component';
import { CalificacionService } from '../../services/calificacion.service';
import { CalificacionSessionService } from '../../services/calificacion-session.service';

describe('RatingComponent', () => {
  let fixture: ComponentFixture<RatingComponent>;
  let api: jasmine.SpyObj<CalificacionService>;
  let session: CalificacionSessionService;
  let navigate: jasmine.Spy;

  beforeEach(() => {
    sessionStorage.removeItem('calificacionEnviada');
    sessionStorage.removeItem('mplp.calificacion.pendiente.v1');
    api = jasmine.createSpyObj<CalificacionService>('CalificacionService', ['obtenerAreas', 'registrarCalificacion']);
    api.obtenerAreas.and.returnValue(of([{ id: 1, codigo: 'mesa-partes', nombre: 'Mesa de Partes' }]));
    TestBed.configureTestingModule({
      imports: [RatingComponent],
      providers: [
        provideRouter([]),
        { provide: CalificacionService, useValue: api },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap({ areaId: '1' }) } } }
      ]
    });
    session = TestBed.inject(CalificacionSessionService);
    navigate = spyOn(TestBed.inject(Router), 'navigate').and.returnValue(Promise.resolve(true));
    fixture = TestBed.createComponent(RatingComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    sessionStorage.removeItem('calificacionEnviada');
    sessionStorage.removeItem('mplp.calificacion.pendiente.v1');
  });

  it('conserva el UUID y respuestas tras un 429 y permite reintentar', () => {
    const component = fixture.componentInstance;
    component.selectRating(5);
    component.comment = 'Mi respuesta';
    api.registrarCalificacion.and.returnValue(throwError(() => new HttpErrorResponse({
      status: 429, headers: new HttpHeaders({ 'Retry-After': '2' })
    })));
    component.onEnviar();
    const original = api.registrarCalificacion.calls.mostRecent().args[0];
    expect(component.submitError).toContain('2 segundos');
    expect(component.pendingRequest).toEqual(original);
    expect(session.obtenerPendiente()).toEqual(original);
    expect(navigate).not.toHaveBeenCalled();
    api.registrarCalificacion.and.returnValue(of({id_envio: original.id_envio,
      creado_en: '2026-09-08T12:00:00Z', mensaje: 'Registrada', duplicado: false}));
    component.onEnviar();
    expect(api.registrarCalificacion.calls.mostRecent().args[0]).toEqual(original);
    expect(navigate).toHaveBeenCalledWith(['/confirmacion'], {replaceUrl: true});
  });

  it('carga el área desde la API y no envía un formulario incompleto', () => {
    expect(fixture.componentInstance.selectedAreaName).toBe('Mesa de Partes');
    fixture.componentInstance.onEnviar();
    expect(api.registrarCalificacion).not.toHaveBeenCalled();
  });

  it('restaura un envío incierto y reintenta con el mismo identificador y respuestas', async () => {
    const component = fixture.componentInstance;
    component.selectRating(5);
    component.answerQuestion('resolvioDudas', false);
    component.comment = 'Atención de prueba';
    api.registrarCalificacion.and.returnValue(throwError(() => new HttpErrorResponse({ status: 0 })));
    component.onEnviar();
    const original = api.registrarCalificacion.calls.mostRecent().args[0];
    expect(component.submitError).toContain('No pudimos confirmar');
    expect(navigate).not.toHaveBeenCalled();
    component.selectRating(1);
    expect(component.selectedRating).toBe(5);
    fixture.destroy();

    fixture = TestBed.createComponent(RatingComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.comment).toBe('Atención de prueba');
    expect(fixture.componentInstance.answeredQuestions.resolvioDudas).toBeTrue();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('textarea').disabled).toBeTrue();
    api.registrarCalificacion.and.returnValue(of({
      id_envio: original.id_envio, creado_en: '2026-08-31T12:00:00Z',
      mensaje: 'Registrada', duplicado: true
    }));
    fixture.componentInstance.onEnviar();
    expect(api.registrarCalificacion.calls.mostRecent().args[0]).toEqual(original);
    expect(navigate).toHaveBeenCalledWith(['/confirmacion'], { replaceUrl: true });
    expect(session.obtenerPendiente()).toBeNull();
  });

  it('sincroniza y bloquea la respuesta para una y cinco estrellas', () => {
    const component = fixture.componentInstance;
    component.selectRating(5);
    expect(component.answeredQuestions.resolvioDudas).toBeTrue();
    expect(component.answerLocked).toBeTrue();
    component.answerQuestion('resolvioDudas', false);
    expect(component.answeredQuestions.resolvioDudas).toBeTrue();
    component.selectRating(1);
    expect(component.answeredQuestions.resolvioDudas).toBeFalse();
    component.answerQuestion('resolvioDudas', true);
    expect(component.answeredQuestions.resolvioDudas).toBeFalse();
    component.selectRating(3);
    expect(component.answerLocked).toBeFalse();
    component.answerQuestion('resolvioDudas', true);
    expect(component.answeredQuestions.resolvioDudas).toBeTrue();
  });

  it('permite corregir un rechazo definitivo sin mostrar una confirmación falsa', () => {
    const component = fixture.componentInstance;
    component.selectRating(4);
    component.answerQuestion('resolvioDudas', true);
    api.registrarCalificacion.and.returnValue(throwError(() => new HttpErrorResponse({ status: 422 })));
    component.onEnviar();
    expect(component.pendingRequest).toBeNull();
    expect(component.formLocked).toBeFalse();
    expect(component.submitError).toContain('No se aceptó');
    expect(navigate).not.toHaveBeenCalled();
  });
});
