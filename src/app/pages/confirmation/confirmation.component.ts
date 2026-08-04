import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-confirmation',
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.scss']
})
export class ConfirmationComponent implements OnInit {

  trackingCode: string = '';
  copied: boolean = false;

  constructor(private router: Router,private location: Location) {}

  ngOnInit(): void {
    this.trackingCode = this.generateTrackingCode();
  }

  goBack(): void {
    this.location.back();
  }

  onVolverInicio(): void {
    this.router.navigate(['/bienvenida']);
  }

  copyCode(): void {
    navigator.clipboard.writeText(this.trackingCode).then(() => {
      this.copied = true;
      setTimeout(() => {
        this.copied = false;
      }, 2000);
    });
  }

  private generateTrackingCode(): string {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `MPLP-${year}${month}${day}-${random}`;
  }
}
