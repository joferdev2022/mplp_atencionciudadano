import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RatingRoutingModule } from './rating-routing.module';
import { RatingComponent } from './rating.component';
import { MaterialModule } from '../../shared/material.module';

@NgModule({
  declarations: [
    RatingComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RatingRoutingModule,
    MaterialModule
  ]
})
export class RatingModule { }
