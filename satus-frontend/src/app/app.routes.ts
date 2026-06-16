import { Routes } from '@angular/router';
import { Landing } from './components/landing/landing';
import { LoginComponent } from './components/login/login';
import { DashboardComponent } from './components/dashboard/dashboard';
import { RegisterComponent } from './components/register/register';
import { Pricing } from './components/pricing/pricing';
import { AdminControl } from './components/admin-control/admin-control';
import { authGuard } from './services/auth.guard';

export const routes: Routes = [
  { path: '', component: Landing },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'pricing', component: Pricing },
  { path: 'admin-control', component: AdminControl, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
