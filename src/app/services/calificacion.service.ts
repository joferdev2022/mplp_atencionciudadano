import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, timeout } from 'rxjs';

import { environment } from '../../environments/environment';
import { Area } from '../models/area.model';
import { CalificacionRequest, CalificacionResponse } from '../models/calificacion-request.model';

@Injectable({ providedIn: 'root' })
export class CalificacionService {
  private readonly http = inject(HttpClient);

  obtenerAreas(): Observable<Area[]> {
    return this.http.get<Area[]>(environment.apiUrl + '/areas').pipe(timeout(15000));
  }

  registrarCalificacion(data: CalificacionRequest): Observable<CalificacionResponse> {
    return this.http.post<CalificacionResponse>(
      environment.apiUrl + '/calificaciones', data
    ).pipe(timeout(15000));
  }
}
