import { Routes } from '@angular/router';
import { Landing } from './components/landing/landing';
import { LoginComponent } from './components/login/login';
import { DashboardComponent } from './components/dashboard/dashboard'; 

export const routes: Routes = [
  { path: '', component: Landing },  
  { path: 'login', component: LoginComponent },       
  { path: 'dashboard', component: DashboardComponent },
  { path: '**', redirectTo: '' }  
];
