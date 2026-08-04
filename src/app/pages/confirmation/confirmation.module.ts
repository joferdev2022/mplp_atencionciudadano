import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmationRoutingModule } from './confirmation-routing.module';
import { ConfirmationComponent } from './confirmation.component';
import { MaterialModule } from '../../shared/material.module';

@NgModule({
  declarations: [
    ConfirmationComponent
  ],
  imports: [
    CommonModule,
    ConfirmationRoutingModule,
    MaterialModule
  ]
})
export class ConfirmationModule { }
