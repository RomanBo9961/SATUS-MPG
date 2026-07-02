import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { TelemetryService } from '../../services/telemetry';
import { Subscription } from 'rxjs';

const BACKEND_URL = window.location.hostname.includes('onrender')
  ? 'https://satus-backend.onrender.com/api'
  : 'http://localhost:3000/api';

@Component({
  selector: 'app-admin-control',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-control.html',
  styleUrl: './admin-control.css'
})
export class AdminControl implements OnInit, OnDestroy {

  //array de lectura logs central ctrl
  liveSystemLogs: Array<{ time: string, text: string }> = [];

  // Matriz elástica que almacenará el mapa global de usuarios extraídos de MongoDB
  public usersList: any[] = [];

  private telemetrySub!: Subscription;

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
    private readonly cd: ChangeDetectorRef,
    private readonly telemetryService: TelemetryService
  ) { }

  ngOnInit() {
    const originalLog = console.log;

    console.log = (...args: any[]) => {
      originalLog.apply(console, args);

      const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ');
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      // Agregamos el objeto al inicio del array
      this.liveSystemLogs.unshift({ time, text: message });

      // Limite de 12 entradas para mantener el rendimiento impecable
      if (this.liveSystemLogs.length > 12) this.liveSystemLogs.pop();

      this.cd.detectChanges();
    };

    console.log("🛰️ [TORRE ADMIN] Inicializando canales de telemetría global...");
    this.checkSecurityClearance();
    this.fetchGlobalUsers();

    this.telemetryService.connectSystem();

    // B. Nos suscribimos al dardo que viene del servidor
    this.telemetrySub = this.telemetryService.getLiveLogs().subscribe((nuevoLog) => {

      console.log(`📡 [${nuevoLog.type}]: ${nuevoLog.message} (Operador: ${nuevoLog.operator})`);
    });
  }

  ngOnDestroy() {
    if (this.telemetrySub) {
      this.telemetrySub.unsubscribe();
    }
    this.telemetryService.disconnectSystem();
  }


  //  Si el usuario actual no es ADMIN, lo expulsa
  private checkSecurityClearance() {
    const userRole = localStorage.getItem('user_role');
    const token = localStorage.getItem('satusToken');

    if (!token || token === 'GUEST_TOKEN' || (userRole !== 'ADMIN' && userRole !== 'SUPAdmin')) {
      console.error("🚨 [ALERTA] Intrusión en ruta administrativa.");
      this.router.navigate(['/']);
    }
  }

  // tRAE usuarios desde el Backend
  public fetchGlobalUsers() {
    const token = localStorage.getItem('satusToken') || localStorage.getItem('access_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    console.log("📥 [MongoDB] Extrayendo inventario de usuarios...");

    // Apuntaremos a la nueva ruta administrativa que expondremos en NestJS
    this.http.get<any[]>('${BACKEND_URL}/users', { headers }).subscribe({
      next: (res: any) => {
        console.log("🛰️ [TORRE CONTROL] Respuesta cruda del Backend recibida:", res);

        //extraccion del array
        if (Array.isArray(res)) {
          this.usersList = res;
        } else if (res && Array.isArray(res.data)) {
          this.usersList = res.data;
        } else if (res && Array.isArray(res.users)) {
          this.usersList = res.users;
        } else {
          // Respaldo de contingencia por si es obj plano
          this.usersList = res ? Object.values(res) : [];
        }

        console.log(`✅ [MongoDB] ${this.usersList.length} expedientes inyectados en la memoria del cliente.`);

        // Fuerza la recarga sobre el renderizado
        this.cd.detectChanges();
      },

      error: (err) => {
        console.error("❌ Falla crítica al succionar telemetría del Backend:", err);
      }
    });
  }

  // Ascención entre rangos (FREE / PRO)
  public toggleUserRole(userId: string, targetTier: 'FREE' | 'PRO') {
    const token = localStorage.getItem('satusToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    console.log(`⚡ [MUTACIÓN DETECTADA] Solicitando cambio de rango a ${targetTier} para el usuario: ${userId}`);

    // Dispararemos una petición transaccional hacia la compuerta administrativa del Backend
    this.http.post('${BACKEND_URL}/users/admin/mutate-role', { userId, targetTier }, { headers }).subscribe({
      next: (res: any) => {
        if (res && res.success) {
          alert(`🏆 Operación Exitosa en MongoDB:\nRango alterado correctamente a nivel de infraestructura.`);

          // Refrescamos el inventario en pantalla al instante para ver los colores mutar en la tabla
          this.fetchGlobalUsers();
        } else {
          alert(`❌ Operación Cancelada por el Servidor: ${res.message}`);
        }
      },
      error: (err) => {
        console.error("🚨 Falla en el bus de datos administrativo:", err);
        alert("❌ Error de comunicación: La torre de control de NestJS no respondió.");
      }
    });
  }

  goToDash() {
    this.router.navigate(['/dashboard']);
  }
}
