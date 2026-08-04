import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

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
    private location: Location
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
    if (this.selectedRating > 0) {
      const data = {
        area: this.selectedAreaName,
        rating: this.selectedRating,
        resolvioDudas: this.answeredQuestions.resolvioDudas,
        tiempoEspera: this.answeredQuestions.tiempoEspera,
        comment: this.comment.trim() || null
      };
      console.log('Calificación enviada:', data);
      this.router.navigate(['/confirmacion']);
    }
  }
}
