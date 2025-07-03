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
      import('./fabric-editor/fabric-editor.component').then(m => m.FabricEditorComponent)
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