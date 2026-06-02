import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html'
})
export class RegisterComponent {

  userData = {
    name: '',
    lastName: '',
    email: '',
    password: '',
    docType: 'CC',
    docNumber: '000000'
  };

  loading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  onRegister() {
    this.loading = true;
    this.errorMessage = '';

    const generatedUsername = (this.userData.name.toLowerCase().trim()) +
      '_' + Math.floor(Math.random() * 999);

    const payload = {
      ...this.userData,
      username: generatedUsername
    };

    console.log('--- [SISTEMA] ENVIANDO REGISTRO:', payload);

    this.authService.register(payload).subscribe({
      next: (res) => {
        console.log('✅ NODO CREADO EXITOSAMENTE');
        // Redireccion al login 
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('❌ FALLO EN EL VÍNCULO:', err);
        this.errorMessage = 'ERROR EN EL PROTOCOLO: El email ya existe o los datos son inválidos.';
        this.loading = false;
      }
    });
  }

  ngOnInit() {
    // CONTROL GOOGPOPUP (Google One Tap)
    if ((window as any).google) {
      (window as any).google.accounts.id.initialize({
        client_id: '231382826392-s8tv5kiimpuc2j27lafdlli6hit51vlb.apps.googleusercontent.com',
        callback: this.handleGoogleCredential.bind(this)
      });

      // Despliegue auto. del pop-up 
      (window as any).google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          console.log('ℹ️ One Tap minimizado o en espera en segundo plano.');
        }
      });
    }
  }

  // Capturar el JWT cifrado de Google
  handleGoogleCredential(response: any) {
    console.log("📥 JWT recibido desde One Tap:", response.credential);

    // REGISTRO / ONE TAP
    // (Asegúrese de tener inyectado 'authService' y 'router' en el constructor de este componente igual que en el login)
    this.authService.loginWithGoogle(response.credential).subscribe({
      next: (res: any) => {
        console.log("🛰️ [NÚCLEO] Nodo registrado/vinculado vía Google con éxito.");
        this.router.navigate(['/dashboard']);
      },
      error: (err: any) => {
        console.error("🚨 [FALLO DE REGISTRO] Google One Tap rechazado:", err);
        alert("ERR: No se pudo verificar la identidad del nodo.");
      }
    });
  }

}
