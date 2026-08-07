import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CalificacionSessionService {
  private readonly storageKey = 'calificacionEnviada';

  marcarComoEnviada(): void {
    sessionStorage.setItem(this.storageKey, 'true');
  }

  limpiar(): void {
    sessionStorage.removeItem(this.storageKey);
  }

  fueEnviada(): boolean {
    return sessionStorage.getItem(this.storageKey) === 'true';
  }
}
