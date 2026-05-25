import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DetectionsService } from '../../services/detections.service';
import { AuthService } from '../../services/auth.service';

declare const google: any;

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './landing.html',
  styleUrl: './landing.css',
})
export class Landing implements OnInit, AfterViewInit {
  loadingSystem = true;
  progress = 0;

  @ViewChild('bgVideo') videoRef!: ElementRef<HTMLVideoElement>;

  // Variables para la info en tiempo real
  aiModel = 'DETECTANDO...';
  latency = '0.00ms';
  vtStatus = 'SINCRONIZANDO...';

  constructor(
    private cd: ChangeDetectorRef,
    private detectionsService: DetectionsService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.initializeGuestSession();
    this.systemBoot();
    this.getLiveSpecs();
    this.igniteGoogleOneTap();
  }

  // DISPARO DEL GOOGLE ONE TAP 
  igniteGoogleOneTap() {
    try {
      // 🪐 CARGADOR PROACTIVO DINÁMICO: Si el script no está en la RAM, lo inyectamos al vuelo [google:5]
      if (typeof google === 'undefined' || !google.accounts?.id) {
        console.log('📡 [NÚCLEO] Inyectando script de Google Identity Services de forma proactiva...');

        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;

        // Cuando el script termine de descargarse en la RAM, ejecuta la inicialización [google:5]
        script.onload = () => this.executeGooglePrompt();
        document.head.appendChild(script);
      } else {
        // Si ya existía en la RAM de la pestaña anterior, arranca directo
        this.executeGooglePrompt();
      }
    } catch (e) {
      console.error('❌ Error al inyectar Google One Tap:', e);
    }
  }

  // Lógica aislada de disparo estándar [google:5]
  private executeGooglePrompt() {
    if (typeof google !== 'undefined' && google.accounts?.id) {
      google.accounts.id.initialize({
        client_id: '231382826392-s8tv5kiimpuc2j27lafdlli6hit51vlb.apps.googleusercontent.com',
        callback: (response: any) => this.handleGoogleCredential(response),
        auto_select: false
      });

      google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed()) {
          console.log('⚠️ GOT no se mostró:', notification.getNotDisplayedReason());
        }
      });
    }
  }

  // PROCESADOR DEL PAQUETE JWT DE GOOGLE
  handleGoogleCredential(response: any) {
    if (response && response.credential) {
      console.log('📡 [NÚCLEO] JWT de Google capturado en la Landing Page, enviando al búnker...');

      // Le enviamos el dardo cifrado al AuthService para que NestJS lo apruebe
      this.authService.loginWithGoogle(response.credential).subscribe({
        next: (res: any) => {
          console.log('✅ Autenticación Google exitosa vía One Tap.');
          // Su AuthService se encargará de redirigir al /dashboard de forma nativa
        },
        error: (err: any) => console.error('❌ El búnker rechazó la firma de Google:', err)
      });
    }
  }

  initializeGuestSession() {
    // Verifica si existe una sesión activa en el monitor
    const currentToken = localStorage.getItem('satusToken');

    if (!currentToken) {

      // Intenta recuperar ID de máquina previo alojado en el LocStg
      let guestId = localStorage.getItem('username');

      if (!guestId || !guestId.startsWith('GUEST_')) {
        // Si el terminal es 100% nuevo, acuñamos su identificador de fábrica aleatorio
        guestId = 'GUEST_' + Math.random().toString(36).substring(2, 8).toUpperCase();
      }

      localStorage.setItem('user_role', 'GUEST');
      localStorage.setItem('username', guestId);

      // Envio a NestJS para persistencia de MongoDB 
      this.authService.syncGuestSession(guestId).subscribe({
        next: (res: any) => {
          console.log(`--- [SISTEMA] NODO ANÓNIMO VINCULADO CORRECTAMENTE EN BD: ${guestId} ---`);
          // Sincronizacion del ecosistema y la extensión
          window.dispatchEvent(new Event('storage'));
        },
        error: (err: any) => {
          console.error("ℹ️ Modo contingencia pasiva - El servidor local está apagado.");
          // Si se inicializa el frontend con el backend apagado
          localStorage.setItem('satusToken', 'GUEST_TOKEN');
          window.dispatchEvent(new Event('storage'));
        }
      });
    }
  }

  ngAfterViewInit() {
    this.playVideo();
  }

  playVideo() {
    if (this.videoRef) {
      const video = this.videoRef.nativeElement;
      video.muted = true;
      video.play().catch(() => {
        window.addEventListener('click', () => video.play(), { once: true });
      });
    }
  }

  getLiveSpecs() {

    this.aiModel = this.detectionsService.currentModel.toUpperCase();

    const tiempoInicio = performance.now();

    this.detectionsService.getGlobalStats().subscribe({
      next: (stats: any) => {
        // Calcula milisegundos de retraso en DB
        const tiempoFin = performance.now();
        this.latency = Math.round(tiempoFin - tiempoInicio) + ' MS';

        const totalVirus = stats?.totalDanger || 0;
        this.vtStatus = totalVirus > 0
          ? `${totalVirus} REGISTROS`
          : 'SISTEMA INTACTO';
      },
      error: (err: any) => {
        console.error("ℹ️ Modo contingencia pasiva - Usando lecturas base.");
        this.latency = '0.00 MS';
        this.vtStatus = 'NODO OFFLINE';
      }
    });
  }

  systemBoot() {
    const interval = setInterval(() => {
      this.progress += Math.floor(Math.random() * 15) + 5;
      this.cd.detectChanges();

      if (this.progress >= 100) {
        this.progress = 100;
        clearInterval(interval);

        setTimeout(() => {
          this.loadingSystem = false;
          this.cd.detectChanges();

          this.getLiveSpecs();

          setInterval(() => {
            this.getLiveSpecs();
          }, 4000);

          setTimeout(() => this.playVideo(), 100);
        }, 800);
      }
    }, 150);
  }
}
