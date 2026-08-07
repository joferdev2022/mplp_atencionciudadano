import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';

import { CalificacionSessionService } from '../services/calificacion-session.service';

@Injectable({
  providedIn: 'root'
})
export class CalificacionEnviadaGuard implements CanActivate {
  constructor(
    private router: Router,
    private calificacionSession: CalificacionSessionService
  ) {}

  canActivate(): boolean | UrlTree {
    return this.calificacionSession.fueEnviada()
      ? this.router.createUrlTree(['/bienvenida'])
      : true;
  }
}
