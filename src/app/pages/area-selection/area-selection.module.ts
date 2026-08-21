import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AreaSelectionRoutingModule } from './area-selection-routing.module';
import { AreaSelectionComponent } from './area-selection.component';
import { MaterialModule } from '../../shared/material.module';

@NgModule({
    imports: [
        CommonModule,
        AreaSelectionRoutingModule,
        MaterialModule,
        AreaSelectionComponent
    ]
})
export class AreaSelectionModule { }
