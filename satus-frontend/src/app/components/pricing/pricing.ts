import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

const BACKEND_URL = window.location.hostname.includes('onrender')
  ? 'https://satus-backend.onrender.com/api'
  : 'http://localhost:3000/api';

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

    console.log(`🌐 [PUENTE STRIPE]: Solicitando pasarela financiera para rango [${targetLicense}] en NestJS...`);

    const tokenReal = localStorage.getItem('satusToken');
    const headers = { 'Authorization': `Bearer ${tokenReal}` };

    // Si el usuario intenta comprar sin haber creado una cuenta base primero
    if (!tokenReal || tokenReal === 'GUEST_TOKEN') {
      alert('🔒 Control de Acceso: Registre una cuenta base gratuita o inicie sesión antes de escalar privilegios.');
      this.router.navigate(['/login']);
      return;
    }

    // Payload y endpoint apuntando hacia la pasarela
    const payload = {
      userId: localStorage.getItem('userId') || 'GUEST_NO_SESSION', // Recuperamos el ID del usuario en MongoDB si existe
      guestId: this.guestId,
      targetLicense: targetLicense
    };

    // Enlaza al controlador dinámico 
    this.http.post('${BACKEND_URL}/payments/create-checkout-session', payload, { headers })
      .subscribe({
        next: (res: any) => {
          if (res && res.success && res.url) {
            console.log('領 [ADUANA STRIPE]: Pasarela generada. Redirigiendo al portal seguro externo...');

            window.location.href = res.url;
          } else {
            alert('❌ Operación Rechazada: El motor financiero no devolvió una pasarela válida.');
          }
        },
        error: (err) => {
          console.error('🚨 Falla crítica en la pasarela de mutación financiera:', err);
          alert('❌ Error de comunicación: Los reactores bancarios del Backend no respondieron.');
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
