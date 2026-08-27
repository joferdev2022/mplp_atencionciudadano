import { Routes } from '@angular/router';

import { CalificacionEnviadaGuard } from './guards/calificacion-enviada.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'bienvenida',
    pathMatch: 'full'
  },
  {
    path: 'bienvenida',
    loadComponent: () =>
      import('./pages/welcome/welcome.component').then(m => m.WelcomeComponent)
  },
  {
    path: 'seleccion-area',
    canActivate: [CalificacionEnviadaGuard],
    loadComponent: () =>
      import('./pages/area-selection/area-selection.component').then(
        m => m.AreaSelectionComponent
      )
  },
  {
    path: 'calificacion',
    canActivate: [CalificacionEnviadaGuard],
    loadComponent: () =>
      import('./pages/rating/rating.component').then(m => m.RatingComponent)
  },
  {
    path: 'confirmacion',
    loadComponent: () =>
      import('./pages/confirmation/confirmation.component').then(
        m => m.ConfirmationComponent
      )
  },
  {
    path: '**',
    redirectTo: 'bienvenida'
  }
];
