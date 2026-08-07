import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CalificacionSessionService } from '../../services/calificacion-session.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent {

  constructor(
    private router: Router,
    private calificacionSession: CalificacionSessionService
  ) {}

  onComenzar(): void {
    this.calificacionSession.limpiar();
    this.router.navigate(['/seleccion-area']);
  }
}
