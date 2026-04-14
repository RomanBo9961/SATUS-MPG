import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; 

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  // Variables para capturar de datos
  userCredentials = {
    username: '',
    password: ''
  };

  constructor(private router: Router) {}

  // Función para simular inicio de sesión
  onLogin() {
    console.log("Iniciando protocolo para:", this.userCredentials.username);
    
  
    // validacion de los ROLES (Admin, SuperAdmin, etc)
    this.router.navigate(['/dashboard']);
  }
}
