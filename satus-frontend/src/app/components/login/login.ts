import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; 
import { AuthService } from '../../services/auth.service';

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
    email: '',
    password: ''
  };

constructor(
    private authService: AuthService, 
    private router: Router
  ) {}

  // Inicio de sesión
 onLogin() {
 
  if (!this.userCredentials.email || !this.userCredentials.password) {
    alert("DENEGADO: Ingrese credenciales.");
    return;
  }

  //console.log("PAQUETE_A_ENVIAR:", this.userCredentials);

  this.authService.login(this.userCredentials).subscribe({
    next: (res) => {
      console.log("Autentificado. Perfil:", res.role);
      this.router.navigate(['/dashboard']);
    },
    error: (err: any) => {
      console.error("Fallo al acceder:", err);
      alert("ERR: Credenciales no válidas.");
    }
  });
}

}
