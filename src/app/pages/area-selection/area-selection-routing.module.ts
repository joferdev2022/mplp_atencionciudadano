import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AreaSelectionComponent } from './area-selection.component';

const routes: Routes = [
  {
    path: '',
    component: AreaSelectionComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AreaSelectionRoutingModule { }
