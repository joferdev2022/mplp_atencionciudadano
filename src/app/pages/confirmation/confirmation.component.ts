import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-confirmation',
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.scss']
})
export class ConfirmationComponent {

  constructor(private router: Router) {}

  onVolverInicio(): void {
    this.router.navigate(['/bienvenida'], { replaceUrl: true });
  }
}
