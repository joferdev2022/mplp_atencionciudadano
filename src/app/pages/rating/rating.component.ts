import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { CalificacionRequest } from '../../models/calificacion-request.model';
import { CalificacionService } from '../../services/calificacion.service';

@Component({
  selector: 'app-rating',
  templateUrl: './rating.component.html',
  styleUrls: ['./rating.component.scss']
})
export class RatingComponent implements OnInit {

  stars: number[] = [1, 2, 3, 4, 5];
  selectedRating: number = 0;
  hoveredRating: number = 0;
  comment: string = '';
  selectedAreaName: string = '';
  isSubmitting: boolean = false;

  answeredQuestions: { resolvioDudas: boolean | null; tiempoEspera: boolean | null } = {
    resolvioDudas: null,
    tiempoEspera: null
  };

  private ratingLabels: { [key: number]: string } = {
    1: 'Muy mala',
    2: 'Mala',
    3: 'Regular',
    4: 'Buena',
    5: 'Excelente'
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private calificacionService: CalificacionService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.selectedAreaName = params['area'] || '';
    });
  }

  goBack(): void {
    this.location.back();
  }

  selectRating(star: number): void {
    this.selectedRating = star;
  }

  onStarHover(star: number): void {
    this.hoveredRating = star;
  }

  onStarLeave(): void {
    this.hoveredRating = 0;
  }

  getRatingLabel(): string {
    const rating = this.hoveredRating || this.selectedRating;
    return this.ratingLabels[rating] || '';
  }

  answerQuestion(question: 'resolvioDudas' | 'tiempoEspera', value: boolean): void {
    this.answeredQuestions[question] = value;
  }

  onEnviar(): void {
    if (this.isSubmitting || !this.isFormValid()) {
      return;
    }

    const data: CalificacionRequest = {
      servicio: this.selectedAreaName,
      estrellas: this.selectedRating,
      pregunta1: this.answeredQuestions.resolvioDudas as boolean,
      pregunta2: this.answeredQuestions.tiempoEspera as boolean,
      observacion: this.comment.trim() || undefined
    };

    this.isSubmitting = true;
    this.calificacionService.registrarCalificacion(data).subscribe({
      next: () => {
        this.resetForm();
        this.isSubmitting = false;
        this.router.navigate(['/confirmacion']);
      },
      error: error => {
        this.isSubmitting = false;
        console.error('Error al enviar la calificación:', error);
      }
    });
  }

  isFormValid(): boolean {
    return this.selectedAreaName.trim().length > 0
      && this.selectedRating > 0
      && this.answeredQuestions.resolvioDudas !== null
      && this.answeredQuestions.tiempoEspera !== null;
  }

  private resetForm(): void {
    this.selectedRating = 0;
    this.hoveredRating = 0;
    this.comment = '';
    this.answeredQuestions = {
      resolvioDudas: null,
      tiempoEspera: null
    };
  }
}
