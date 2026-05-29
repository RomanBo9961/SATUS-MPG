import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-control',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-control.html',
  styleUrl: './admin-control.css'
})
export class AdminControl implements OnInit {

  // Matriz elástica que almacenará el mapa global de usuarios extraídos de MongoDB
  public usersList: any[] = [];

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
    private readonly cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
    console.log("🛰️ [TORRE ADMIN] Inicializando canales de telemetría global...");
    this.checkSecurityClearance();
    this.fetchGlobalUsers();
  }

  //  Si el usuario actual no es ADMIN, lo expulsamos
  private checkSecurityClearance() {
    const userRole = localStorage.getItem('user_role');
    const token = localStorage.getItem('satusToken');

    // Cortafuegos local: Si intenta saltarse el path escribiéndolo en la barra de navegación
    if (!token || token === 'GUEST_TOKEN' || (userRole !== 'ADMIN' && userRole !== 'SUPAdmin')) {
      console.error("🚨 [ALERTA PRIVILEGIOS] Intento de intrusión detectado en ruta administrativa.");
      this.router.navigate(['/']);
    }
  }

  // 📥 EXTRACCIÓN MASIVA: Succiona el catálogo completo de usuarios desde el Backend
  public fetchGlobalUsers() {
    const token = localStorage.getItem('satusToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    console.log("📥 [MongoDB] Extrayendo inventario de usuarios...");

    // Apuntaremos a la nueva ruta administrativa que expondremos en NestJS
    this.http.get<any[]>('/api/users', { headers }).subscribe({
      next: (res: any[]) => {
        this.usersList = res;
        this.cd.detectChanges();
        console.log(`✅ [MongoDB] ${this.usersList.length} expedientes cargados con éxito.`);
      },
      error: (err) => {
        console.error("❌ Falla crítica al succionar telemetría del Backend:", err);
      }
    });
  }

  // 🚀 INTERRUPTOR MANUAL EN CALIENTE: Mutación instantánea de rangos (FREE / PRO)
  public toggleUserRole(userId: string, targetTier: 'FREE' | 'PRO') {
    const token = localStorage.getItem('satusToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    console.log(`⚡ [MUTACIÓN DETECTADA] Solicitando cambio de rango a ${targetTier} para el usuario: ${userId}`);

    // Dispararemos una petición transaccional hacia la compuerta administrativa del Backend
    this.http.post('/api/users/admin/mutate-role', { userId, targetTier }, { headers }).subscribe({
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
}
