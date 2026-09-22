import { Injectable } from '@angular/core';
import { CalificacionRequest } from '../models/calificacion-request.model';

@Injectable({ providedIn: 'root' })
export class CalificacionSessionService {
  private readonly storageKey = 'calificacionEnviada';
  private readonly pendingKey = 'mplp.calificacion.pendiente.v1';
  private enviada = false;

  marcarComoEnviada(): void {
    this.enviada = true;
    try {
      sessionStorage.setItem(this.storageKey, 'true');
      sessionStorage.removeItem(this.pendingKey);
    } catch {
      // La confirmación del servidor sigue siendo válida si falla el almacenamiento.
    }
  }

  limpiar(): void {
    this.enviada = false;
    try {
      sessionStorage.removeItem(this.storageKey);
    } catch {
      // No eliminar aquí un envío pendiente: podría estar guardado en MySQL.
    }
  }

  fueEnviada(): boolean {
    try {
      return this.enviada || sessionStorage.getItem(this.storageKey) === 'true';
    } catch {
      return this.enviada;
    }
  }

  obtenerPendiente(): CalificacionRequest | null {
    try {
      const raw = sessionStorage.getItem(this.pendingKey);
      const data: unknown = raw ? JSON.parse(raw) : null;
      return this.esSolicitud(data) ? data : null;
    } catch {
      return null;
    }
  }

  prepararEnvio(data: Omit<CalificacionRequest, 'id_envio'>): CalificacionRequest | null {
    const pendiente = this.obtenerPendiente();
    if (pendiente) {
      return pendiente;
    }
    const request: CalificacionRequest = { ...data, id_envio: this.crearIdEnvio() };
    try {
      // Persistir antes del POST conserva el mismo identificador tras una recarga.
      sessionStorage.setItem(this.pendingKey, JSON.stringify(request));
      return request;
    } catch {
      return null;
    }
  }

  limpiarPendiente(): void {
    sessionStorage.removeItem(this.pendingKey);
  }

  private crearIdEnvio(): string {
    if (typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    // getRandomValues también permite probar desde un celular en HTTP de la red local.
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
    return [hex.slice(0, 8), hex.slice(8, 12), hex.slice(12, 16), hex.slice(16, 20), hex.slice(20)].join('-');
  }

  private esSolicitud(value: unknown): value is CalificacionRequest {
    if (!value || typeof value !== 'object') {
      return false;
    }
    const data = value as Record<string, unknown>;
    return typeof data['id_envio'] === 'string'
      && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(data['id_envio'])
      && typeof data['area_id'] === 'number'
      && Number.isInteger(data['area_id']) && data['area_id'] > 0
      && typeof data['estrellas'] === 'number'
      && Number.isInteger(data['estrellas']) && data['estrellas'] >= 1 && data['estrellas'] <= 5
      && typeof data['resolvio_dudas'] === 'boolean'
      && (data['observacion'] === null || (typeof data['observacion'] === 'string' && data['observacion'].length <= 500))
      && ['qr_general', 'qr_area', 'web'].includes(String(data['canal']));
  }
}
