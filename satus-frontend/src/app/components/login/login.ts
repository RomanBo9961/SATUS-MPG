import { Component, AfterViewInit } from '@angular/core';
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
export class LoginComponent implements AfterViewInit {
  // Variables para capturar de datos
  userCredentials = {
    email: '',
    password: ''
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  // mostrar/ocultar contraseña 
  showPassword = false;

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  // Inicio de sesión
  onLogin() {

    if (!this.userCredentials.email || !this.userCredentials.password) {
      alert("DENEGADO: Ingrese credenciales.");
      return;
    }

    this.userCredentials.email = this.userCredentials.email.trim();
    this.userCredentials.password = this.userCredentials.password.trim();

    console.log("📡 PAQUETE A ENVIAR SANITIZADO:", this.userCredentials);

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

  ngAfterViewInit() {
    // INYECTOR DE SCRIPT POR SOFTWARE GOOG
    const inyectarScriptGoogle = () => {
      return new Promise((resolve) => {
        if ((window as any).google?.accounts?.id) {
          resolve(true);
          return;
        }
        // Crea la etiqueta de script en en la RAM
        const script = document.createElement('script');

        // Ruta de la librería Goog Identity
        script.src = 'https://accounts.google.com/gsi/client';

        script.async = true;
        script.defer = true;
        script.onload = () => resolve(true);
        script.onerror = () => console.error('🚨 [ERROR CRÍTICO] La red bloqueó el script de Google.');
        document.head.appendChild(script);
      });
    };

    // EJECUCIÓN SECUENCIAL 
    inyectarScriptGoogle().then(() => {
      if ((window as any).google?.accounts?.id) {

        // Inicializar las credenciales de Google Cloud Console
        (window as any).google.accounts.id.initialize({
          client_id: '231382826392-s8tv5kiimpuc2j27lafdlli6hit51vlb.apps.googleusercontent.com',
          callback: this.handleGoogleCredential.bind(this)
        });

        // Forzar el dibujo del botón sobre HTML
        const contenedor = document.getElementById('googleBtnAnchor');
        if (contenedor) {
          (window as any).google.accounts.id.renderButton(contenedor, {
            type: 'standard',
            shape: 'rectangular',
            theme: 'dark',
            text: 'signin_with',
            size: 'large',
            logo_alignment: 'left',
            width: 382
          });
          console.log("🛰️ [NÚCLEO] ¡Botón de Google inyectado por software con éxito!");
        }
      }
    });
  }

  // Recibir el token cifrado de Google
  handleGoogleCredential(response: any) {
    //console.log("📥 JWT capturado con éxito:", response.credential);
    this.authService.loginWithGoogle(response.credential).subscribe({
      next: (res: any) => {
        //console.log("🛰️ [NÚCLEO] Bypass por hardware aprobado. Accediendo al Dashboard...");
        // Al loguear con éxito, se enruta directo a las pantallas de control
        this.router.navigate(['/dashboard']);
      },
      error: (err: any) => {
        console.error("🚨 [FALLO DE ADUANA] El token de Google fue rechazado:", err);
        alert("ERR: Vínculo de Google no autorizado en este nodo.");
      }
    });
  }

  goToReg() {
    this.router.navigate(['/register']);
  }
}
