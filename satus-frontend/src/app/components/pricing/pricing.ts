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

  public currentRole: string | null = '';

  // Capturamos el ID de la máquina para enlazar la migración de escaneos
  private guestId: string | null = null;

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router
  ) { }

  ngOnInit() {

    this.currentRole = localStorage.getItem('user_role');
    console.log(`[PRICING] Aduana inicializada para el rango: [${this.currentRole}]`);

    // Extraemos la firma de hardware que acuñó la Landing en la Fase 1
    this.guestId = localStorage.getItem('username');
    console.log(`📡 [PRICING NÚCLEO] Terminal indexada para escalamiento: ${this.guestId}`);
  }

  // EL REFACTOR DE ESCALAMIENTO ASÍNCRONO 
  triggerUpgrade(targetLicense: 'AVANZADO' | 'PRO') {
    if (!this.guestId) {
      alert('⚠️ Error Perimetral: No se localizó la firma de hardware de este dispositivo.');
      return;
    }

    console.log(`⚡ [PUENTE]: Solicitando mutación hacia rango [${targetLicense}] en NestJS...`);

    const tokenReal = localStorage.getItem('satusToken');
    const headers = { 'Authorization': `Bearer ${tokenReal}` };

    // Si el usuario intenta comprar sin haber creado una cuenta base primero
    if (!tokenReal || tokenReal === 'GUEST_TOKEN') {
      alert('🔒 Control de Acceso: Registre una cuenta base gratuita o inicie sesión antes de escalar privilegios.');
      this.router.navigate(['/login']);
      return;
    }

    // Enlaza al controlador dinámico 
    this.http.post('/api/auth/upgrade-license',
      { guestId: this.guestId, targetLicense },
      { headers: { 'Authorization': `Bearer ${tokenReal}` } }
    ).subscribe({
      next: (res: any) => {
        if (res && res.success) {
          console.log('✅ Aduana SATUS: Rango validado. Criptografía ${targetLicense}License inyectada.');

          // 1. Sobreescribimos las llaves locales con los nuevos privilegios relacionales
          localStorage.setItem('satusToken', res.token);
          localStorage.setItem('user_role', res.newRoleName);

          // Desata el evento para que popup.js y content.js muten al Modo PRO al instante 
          window.dispatchEvent(new Event('storage'));

          alert(`🎉 ¡Felicidades! Sistema escalado a RANGO ${targetLicense}.`);

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

  handleBusinessAction() {
    if (this.currentRole === 'AVZAccount' || this.currentRole === 'PROLicense') {
      console.log('📡 [PRICING] Redirección activa: El nodo ya cuenta con los privilegios. Regresando al panel...');
      this.router.navigate(['/dashboard']);
      return;
    }
    this.triggerUpgrade('AVANZADO');
  }

  goToDash() {
    this.router.navigate(['/dashboard']);
  }
}
