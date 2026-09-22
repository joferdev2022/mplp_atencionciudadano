import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CalificacionSessionService } from '../services/calificacion-session.service';

export const calificacionConfirmadaGuard: CanActivateFn = () =>
  inject(CalificacionSessionService).fueEnviada()
    ? true
    : inject(Router).createUrlTree(['/bienvenida']);
