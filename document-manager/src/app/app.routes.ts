import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'sign-in',
    loadChildren: () => import('./modules/auth/auth.module').then((m) => m.AuthModule)
  },
  {
    path: 'documents',
    loadChildren: () => import('./modules/documents/documents.module').then((m) => m.DocumentsModule),
    canActivate: [AuthGuard]
  },
  { path: '', redirectTo: '/documents', pathMatch: 'full' },
  {
    path: '**',
    redirectTo: '/',
    pathMatch: 'full'
  }
];


