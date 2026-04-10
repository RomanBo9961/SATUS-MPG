import { Routes } from '@angular/router';
import { Landing } from './components/landing/landing';
import { DashboardComponent } from './components/dashboard/dashboard'; 

export const routes: Routes = [
  { path: '', component: Landing },         
  { path: 'dashboard', component: DashboardComponent },
  { path: '**', redirectTo: '' }  
];
