import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmationRoutingModule } from './confirmation-routing.module';
import { ConfirmationComponent } from './confirmation.component';
import { MaterialModule } from '../../shared/material.module';

@NgModule({
    imports: [
        CommonModule,
        ConfirmationRoutingModule,
        MaterialModule,
        ConfirmationComponent
    ]
})
export class ConfirmationModule { }
