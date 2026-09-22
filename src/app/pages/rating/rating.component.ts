import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CalificacionRequest } from '../../models/calificacion-request.model';
import { CalificacionService } from '../../services/calificacion.service';
import { CalificacionSessionService } from '../../services/calificacion-session.service';
import { MatRipple } from '@angular/material/core';
import { MatIcon } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-rating',
  templateUrl: './rating.component.html',
  styleUrls: ['./rating.component.scss'],
  imports: [MatRipple, MatIcon, FormsModule, MatButton, MatProgressSpinner]
})
export class RatingComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(CalificacionService);
  private readonly session = inject(CalificacionSessionService);
  private readonly destroyRef = inject(DestroyRef);

  stars = [1, 2, 3, 4, 5];
  selectedRating = 0;
  hoveredRating = 0;
  comment = '';
  selectedAreaName = '';
  selectedAreaId = 0;
  isSubmitting = false;
  isLoadingArea = false;
  areaError = '';
  submitError = '';
  pendingRequest: CalificacionRequest | null = null;
  answeredQuestions: { resolvioDudas: boolean | null } = { resolvioDudas: null };

  private readonly ratingLabels: Record<number, string> = {
    1: 'Muy mala', 2: 'Mala', 3: 'Regular', 4: 'Buena', 5: 'Excelente'
  };

  ngOnInit(): void {
    this.pendingRequest = this.session.obtenerPendiente();
    const rawAreaId = this.route.snapshot.queryParamMap.get('areaId') ?? '';
    this.selectedAreaId = this.pendingRequest?.area_id
      ?? (/^[1-9]\d*$/.test(rawAreaId) ? Number(rawAreaId) : 0);
    if (!Number.isSafeInteger(this.selectedAreaId) || this.selectedAreaId <= 0 || this.selectedAreaId > 4294967295) {
      void this.router.navigate(['/seleccion-area'], { replaceUrl: true });
      return;
    }
    if (this.pendingRequest) {
      this.selectedRating = this.pendingRequest.estrellas;
      this.comment = this.pendingRequest.observacion ?? '';
      this.answeredQuestions.resolvioDudas = this.pendingRequest.resolvio_dudas;
    }
    this.cargarArea();
  }

  cargarArea(): void {
    if (this.isLoadingArea) return;
    this.isLoadingArea = true;
    this.areaError = '';
    this.api.obtenerAreas().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: areas => {
        const area = areas.find(item => item.id === this.selectedAreaId);
        this.selectedAreaName = area?.nombre ?? '';
        this.isLoadingArea = false;
        if (!area) this.areaError = 'El área seleccionada ya no está disponible. Vuelve a elegir un área.';
      },
      error: () => {
        this.isLoadingArea = false;
        this.areaError = 'No pudimos comprobar el área. Revisa tu conexión y vuelve a intentarlo.';
      }
    });
  }

  get formLocked(): boolean {
    return this.pendingRequest !== null || this.isSubmitting || this.isLoadingArea || !this.selectedAreaName;
  }

  goBack(): void {
    if (!this.pendingRequest && !this.isSubmitting) {
      void this.router.navigate(['/seleccion-area']);
    }
  }

  selectRating(star: number): void {
    if (this.formLocked) return;
    this.selectedRating = star;
    if (star === 5) this.answeredQuestions.resolvioDudas = true;
    if (star === 1) this.answeredQuestions.resolvioDudas = false;
  }

  get answerLocked(): boolean {
    return this.selectedRating === 1 || this.selectedRating === 5;
  }

  get automaticAnswerText(): string {
    if (this.selectedRating === 5) return 'Con 5 estrellas se marca Sí automáticamente.';
    if (this.selectedRating === 1) return 'Con 1 estrella se marca No automáticamente.';
    return '';
  }

  onStarHover(star: number): void {
    if (!this.formLocked) this.hoveredRating = star;
  }

  onStarLeave(): void {
    this.hoveredRating = 0;
  }

  getRatingLabel(): string {
    return this.ratingLabels[this.hoveredRating || this.selectedRating] || '';
  }

  answerQuestion(question: 'resolvioDudas', value: boolean): void {
    if (!this.formLocked && !this.answerLocked) this.answeredQuestions[question] = value;
  }

  onEnviar(): void {
    if (this.isSubmitting || !this.isFormValid()) return;

    if (!this.pendingRequest) {
      this.pendingRequest = this.session.prepararEnvio({
        area_id: this.selectedAreaId,
        estrellas: this.selectedRating,
        resolvio_dudas: this.answeredQuestions.resolvioDudas === true,
        observacion: this.comment.trim() || null,
        canal: 'qr_general'
      });
    }
    if (!this.pendingRequest) {
      this.submitError = 'No se pudo preparar el envío. Permite el almacenamiento temporal de este sitio en tu navegador y reintenta.';
      return;
    }

    const request = this.pendingRequest;
    this.isSubmitting = true;
    this.submitError = '';
    this.api.registrarCalificacion(request).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: response => {
        this.isSubmitting = false;
        if (response.id_envio !== request.id_envio) {
          this.submitError = 'No pudimos confirmar tu respuesta. Reintenta el mismo envío.';
          return;
        }
        this.session.marcarComoEnviada();
        this.pendingRequest = null;
        void this.router.navigate(['/confirmacion'], { replaceUrl: true });
      },
      error: (error: unknown) => {
        this.isSubmitting = false;
        const status = error instanceof HttpErrorResponse ? error.status : 0;
        if (status === 429) {
          const seconds = error instanceof HttpErrorResponse ? Number(error.headers.get('Retry-After')) : 0;
          const wait = Number.isFinite(seconds) && seconds > 0
            ? `Espera aproximadamente ${Math.ceil(seconds)} segundos y pulsa Reintentar envío.`
            : 'Espera unos segundos y pulsa Reintentar envío.';
          this.submitError = `Hay muchas solicitudes en este momento. ${wait} Tus respuestas se conservaron.`;
        } else if ([404, 409, 422].includes(status)) {
          this.session.limpiarPendiente();
          this.pendingRequest = null;
          this.submitError = status === 404
            ? 'El área ya no está disponible. Vuelve a elegir un área.'
            : status === 409
              ? 'El identificador del envío ya se utilizó con otras respuestas. Revisa tus datos antes de volver a enviar.'
              : 'No se aceptó la respuesta. Revisa la calificación y el comentario.';
          if (status === 404) this.selectedAreaName = '';
        } else {
          this.submitError = 'No pudimos confirmar el guardado. Tus respuestas se conservaron: pulsa Reintentar envío para comprobarlo sin duplicarlas.';
        }
      }
    });
  }

  isFormValid(): boolean {
    if (this.pendingRequest) return true;
    return !this.isLoadingArea && !!this.selectedAreaName
      && Number.isInteger(this.selectedRating) && this.selectedRating >= 1 && this.selectedRating <= 5
      && this.answeredQuestions.resolvioDudas !== null
      && !(this.selectedRating === 5 && !this.answeredQuestions.resolvioDudas)
      && !(this.selectedRating === 1 && this.answeredQuestions.resolvioDudas)
      && this.comment.length <= 500;
  }
}
