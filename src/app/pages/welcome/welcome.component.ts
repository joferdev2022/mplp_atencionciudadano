import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CalificacionSessionService } from '../../services/calificacion-session.service';
import { MatButton } from '@angular/material/button';
import { MatRipple } from '@angular/material/core';

@Component({
    selector: 'app-welcome',
    templateUrl: './welcome.component.html',
    styleUrls: ['./welcome.component.scss'],
    imports: [MatButton, MatRipple]
})
export class WelcomeComponent {

  constructor(
    private router: Router,
    private calificacionSession: CalificacionSessionService
  ) {}

  onComenzar(): void {
    this.calificacionSession.limpiar();
    const pendiente = this.calificacionSession.obtenerPendiente();
    this.router.navigate(pendiente ? ['/calificacion'] : ['/seleccion-area'], {
      queryParams: pendiente ? { areaId: pendiente.area_id } : undefined
    });
  }
}
