import { CanvasProjectWrapperComponent } from './canvas-project-wrapper/canvas-project-wrapper.component';
// app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'editor',
    pathMatch: 'full'
  },
  {
    path: 'editor',
    loadComponent: () =>
      import('./canvas-project-wrapper/canvas-project-wrapper.component').then(m => m.CanvasProjectWrapperComponent)
  },
  {
    path: 'invite/:token',
    loadComponent: () =>
      import('./rsvp-form/rsvp-form.component').then(m => m.RsvpFormComponent)
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
  },
  {
    path: '**',
    redirectTo: 'editor'
  }
];
