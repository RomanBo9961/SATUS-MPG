import { Routes } from '@angular/router';
import { Landing } from './components/landing/landing';
import { LoginComponent } from './components/login/login';
import { DashboardComponent } from './components/dashboard/dashboard';
import { RegisterComponent } from './components/register/register';
import { Pricing } from './components/pricing/pricing';

export const routes: Routes = [
  { path: '', component: Landing },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'pricing', component: Pricing },
  { path: '**', redirectTo: '' }
];
