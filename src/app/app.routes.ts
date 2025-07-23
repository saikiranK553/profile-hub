import { Routes } from '@angular/router';
import { authGuard } from './shared/auth.guard';

export const routes: Routes = [
    {
        path:'auth',
        loadChildren:()=>import('./auth/auth.routes').then(m=>m.authRoutes),
    },
    {
    path: 'dashboard',
    loadChildren: () => import('./dashboard/dashboard.routes').then(m => m.dashboardRoutes),
    canActivate: [authGuard],
  },
    {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'auth/login',
  },
];
