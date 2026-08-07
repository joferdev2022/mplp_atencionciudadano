import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { CalificacionRequest } from '../models/calificacion-request.model';

@Injectable({
  providedIn: 'root'
})
export class CalificacionService {
  constructor(private http: HttpClient) {}

  registrarCalificacion(data: CalificacionRequest): Observable<string> {
    const body = new HttpParams()
      .set('servicio', data.servicio)
      .set('estrellas', data.estrellas.toString())
      .set('pregunta1', data.pregunta1 ? 'SI' : 'NO')
      .set('pregunta2', data.pregunta2 ? 'SI' : 'NO')
      .set('observacion', data.observacion ?? '');

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    return this.http.post(environment.calificacionesApiUrl, body.toString(), {
      headers,
      responseType: 'text'
    });
  }
}
