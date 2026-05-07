import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DetectionsService } from '../../services/detections.service';
import { AuthService } from '../../services/auth.service';

declare const chrome: any; 

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit, AfterViewInit {
  detections: any[] = [];
  loading = true;
  userRole: string = 'GUEST';
  userName: string = 'INVITADO';

  @ViewChild('bgVideo') videoRef!: ElementRef<HTMLVideoElement>;

  // 1. INYECTAMOS el detector de cambios en el constructor
  constructor(
    private detectionsService: DetectionsService,
    private cd: ChangeDetectorRef,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.userRole = this.authService.getRole();
    console.log(`--- [NODO_DASHBOARD] RANGO DETECTADO: ${this.userRole} ---`);
    this.userName = this.authService.getUsername();

  // 📢 GRITO DE IDENTIDAD: Forzamos a la extensión a recibir los datos
  if (typeof chrome !== 'undefined' && chrome.runtime?.id) {
    chrome.runtime.sendMessage({
      action: "SYNC_AUTH",
      token: localStorage.getItem('satusToken'),
      user: { username: this.userName, role: this.userRole }
    });
  }
    
    setTimeout(() => {
      this.userRole = this.authService.getRole();
      this.cd.detectChanges();
      this.loadHistory();
    }, 800);
  }

  ngAfterViewInit() {
    if (this.videoRef) {
      const video = this.videoRef.nativeElement;
      video.muted = true;
      video.play().catch(err => {
        console.log("Esperando interacción para iniciar video...");
        window.addEventListener('click', () => video.play(), { once: true });
      });
    }
  }

  loadHistory() {
    this.detectionsService.getHistory().subscribe({
      next: (data) => {
        if (data && Array.isArray(data)) {
          this.detections = data.map((item: any) => ({
            ...item,
            message: item.message ? item.message.replace(/\*\*/g, '') : 'Sin reporte disponible',
            expanded: false // controla el "Ver más"
          }));
        }
        this.loading = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Error:', err);
        this.loading = false;
        this.cd.detectChanges();
      }
    });
  }

  // Truncar el texto (35-40 palabras)
  getShortMessage(text: string): string {
    const words = text.split(' ');
    if (words.length <= 40) return text;
    return words.slice(0, 40).join(' ') + '...';
  }

  calculateIntegrity(): number {
    if (this.detections.length === 0) return 100;
    // Contamos ALTOS ignorando espacios o mayúsculas rebeldes
    const threats = this.detections.filter(d =>
      d.riskLevel?.trim().toUpperCase() === 'ALTO'
    ).length;

    const score = 100 - (threats * 10);
    return score < 5 ? 5 : score;
  }

  onLogout() {
    // Confirmación rápida estilo terminal
    if (confirm("¿TERMINAR SESIÓN Y CERRAR VÍNCULO?")) {
      this.authService.logout();
    }
  }
}
