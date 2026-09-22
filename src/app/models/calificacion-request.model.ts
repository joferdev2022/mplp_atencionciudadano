export type CanalCalificacion = 'qr_general' | 'qr_area' | 'web';

export interface CalificacionRequest {
  readonly id_envio: string;
  readonly area_id: number;
  readonly estrellas: number;
  readonly resolvio_dudas: boolean;
  readonly observacion: string | null;
  readonly canal: CanalCalificacion;
}

export interface CalificacionResponse {
  id_envio: string;
  creado_en: string;
  mensaje: string;
  duplicado: boolean;
}
