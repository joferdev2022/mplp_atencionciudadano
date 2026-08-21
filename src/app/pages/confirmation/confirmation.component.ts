import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { MatRipple } from '@angular/material/core';

@Component({
    selector: 'app-confirmation',
    templateUrl: './confirmation.component.html',
    styleUrls: ['./confirmation.component.scss'],
    imports: [MatButton, MatRipple]
})
export class ConfirmationComponent {

  constructor(private router: Router) {}

  onVolverInicio(): void {
    this.router.navigate(['/bienvenida'], { replaceUrl: true });
  }
}
