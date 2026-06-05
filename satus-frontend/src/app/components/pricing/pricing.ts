import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pricing.html',
  styleUrl: './pricing.css'
})
export class Pricing implements OnInit {

  // Capturamos el ID de la máquina para enlazar la migración de escaneos
  private guestId: string | null = null;

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router
  ) { }

  ngOnInit() {
    // Extraemos la firma de hardware que acuñó la Landing en la Fase 1
    this.guestId = localStorage.getItem('username');
    console.log(`📡 [PRICING NÚCLEO] Terminal indexada para escalamiento: ${this.guestId}`);
  }

  // EL REFACTOR DE ESCALAMIENTO ASÍNCRONO 
  triggerProUpgrade() {
    if (!this.guestId) {
      alert('⚠️ Error Perimetral: No se localizó la firma de hardware de este dispositivo.');
      return;
    }

    const tokenReal = localStorage.getItem('satusToken');

    // Si el usuario intenta comprar sin haber creado una cuenta base primero
    if (!tokenReal || tokenReal === 'GUEST_TOKEN') {
      alert('🔒 Control de Acceso: Registre una cuenta base gratuita o inicie sesión antes de escalar privilegios.');
      this.router.navigate(['/login']);
      return;
    }

    console.log('⚡ Disparando ráfaga de migración relacional hacia NestJS...');

    // Enlaza al controlador dinámico 
    this.http.post('/api/auth/upgrade-license',
      { guestId: this.guestId },
      { headers: { 'Authorization': `Bearer ${tokenReal}` } }
    ).subscribe({
      next: (res: any) => {
        if (res && res.success) {
          console.log('✅ Aduana SATUS: Rango validado. Criptografía PROLicense inyectada.');

          // 1. Sobreescribimos las llaves locales con los nuevos privilegios relacionales
          localStorage.setItem('satusToken', res.token);
          localStorage.setItem('user_role', 'PROLicense');

          // Desata el evento para que popup.js y content.js muten al Modo PRO al instante 
          window.dispatchEvent(new Event('storage'));

          alert(`🏆 ¡Felicidades! Sistema escalado a NÚCLEO PRO.\nSus escaneos históricos del nodo ${this.guestId} han sido heredados con éxito.`);

          this.router.navigate(['/dashboard']);
        } else {
          alert(`❌ Operación Rechazada: ${res.message || 'Error desconocido en aduana.'}`);
        }
      },
      error: (err) => {
        console.error('🚨 Falla crítica en la pasarela de mutación:', err);
        alert('❌ Error de comunicación: Los reactores del Backend no respondieron.');
      }
    });
  }

  goToDash() {
    this.router.navigate(['/dashboard']);
  }
}
