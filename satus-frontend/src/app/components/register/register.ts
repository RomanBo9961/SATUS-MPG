import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
  ) {}

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
}
