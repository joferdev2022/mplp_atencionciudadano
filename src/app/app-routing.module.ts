import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'bienvenida',
    pathMatch: 'full'
  },
  {
    path: 'bienvenida',
    loadChildren: () => import('./pages/welcome/welcome.module').then(m => m.WelcomeModule)
  },
  {
    path: 'seleccion-area',
    loadChildren: () => import('./pages/area-selection/area-selection.module').then(m => m.AreaSelectionModule)
  },
  {
    path: 'calificacion',
    loadChildren: () => import('./pages/rating/rating.module').then(m => m.RatingModule)
  },
  {
    path: 'confirmacion',
    loadChildren: () => import('./pages/confirmation/confirmation.module').then(m => m.ConfirmationModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
