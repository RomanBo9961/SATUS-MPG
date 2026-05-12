import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DetectionsService } from '../../services/detections.service';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';

declare const chrome: any;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule,],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit, AfterViewInit {
  detections: any[] = [];
  loading = true;
  userRole: string = 'GUEST';
  userName: string = 'INVITADO';

  // VARIABLES PARA EL RADAR
  private searchSubject = new Subject<string>();
  searchQuery: string = '';
  currentPage: number = 1;
  pageSize: number = 3;
  filter: string = 'ALL';

  @ViewChild('bgVideo') videoRef!: ElementRef<HTMLVideoElement>;

  // 1. INYECTAMOS el detector de cambios en el constructor
  constructor(
    private detectionsService: DetectionsService,
    private cd: ChangeDetectorRef,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.userRole = this.authService.getRole();
    this.userName = this.authService.getUsername();
    console.log(`--- [NODO_DASHBOARD] RANGO DETECTADO: ${this.userRole} ---`);

    // --- CONFIG DEL RADAR (filtrado & busqeuda) ---
    this.searchSubject.pipe(
      debounceTime(400), // Espera 400ms tras dejar de escribir
      distinctUntilChanged() // Solo busca si el texto cambió
    ).subscribe(query => {
      this.searchQuery = query;
      this.currentPage = 1; // Volvemos al Sector 1 al buscar
      this.loadHistory();
    });

    window.postMessage({
      source: 'SATUS_DASHBOARD',
      action: "SYNC_AUTH",
      token: localStorage.getItem('satusToken'),
      user: { username: this.userName, role: this.userRole }
    }, "*");

    // Fuerza a la extensión a recibir los datos
    if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
      try {
        chrome.runtime.sendMessage({
          action: "SYNC_AUTH",
          token: localStorage.getItem('satusToken'),
          user: { username: this.userName, role: this.userRole }
        });
      } catch (e) {
        console.log("ℹ️ Conexión directa no disponible, usando túnel PostMessage.");
      }
    }

    setTimeout(() => {
      this.userRole = this.authService.getRole();
      this.cd.detectChanges();
      this.loadHistory();
    }, 800);
  }

  //Metodo RADAR 
  onSearch() {
    this.searchSubject.next(this.searchQuery);
  }

  setFilter(type: string) {
    this.filter = type;
    this.currentPage = 1;
    this.loadHistory();
  }

  formatReport(text: string): string {
    if (!text) return '';

    return text
      // 1. Limpieza de negritas de IA (**) y separadores (==)
      .replace(/\*\*/g, '')
      .replace(/==+/g, '')

      // 2. Encabezados 
      .replace(/Advertencia:/gi, '<br><span class="text-satus-alert font-bold tracking-widest"> ⚠️ [ ADVERTENCIA ]</span><br>')
      .replace(/Análisis:/gi, '<br><span class="text-satus-report font-bold tracking-widest"> 📡 ANÁLISIS </span><br>')
      .replace(/Conclusi(?:ón|ones):/gi, '<br><span class="text-satus-report font-bold tracking-widest"> 📋 CONCLUSIÓN </span><br>')
      .replace(/DATOS TÉCNICOS:/gi, '<br><span class="text-white/50 border-b border-white/10 block mb-1">■ DATOS TÉCNICOS</span>')
      .replace(/Recomendaci(?:ón|ones):/gi, '<br><span class="text-satus-report font-bold tracking-widest"> A Considerar... </span><br>')

      // 3. Formateo de Listas y URL
      .replace(/URL:/gi, '<br><span class="opacity-40">>> TARGET:</span>')
      .replace(/\* /g, '<br>&nbsp;&nbsp;<span class="text-satus-neon">↳</span> ')
      .trim();
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

    this.loading = true;
    this.cd.detectChanges();

    this.detectionsService.getHistory(
      this.currentPage,
      this.pageSize,
      this.searchQuery,
      this.filter
    ).subscribe({
      next: (data) => {
        if (data && Array.isArray(data)) {
          this.detections = data.map((item: any) => ({
            ...item,
            message: item.message ? item.message.replace(/\*\*/g, '') : 'Sin reporte disponible',
            expanded: false // controla el "Ver más"
          }));
        }
        this.loading = false; // Cerramos el radar
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Error:', err);
        this.loading = false;
        this.cd.detectChanges();
      }
    });
  }

  nextPage() {
    this.currentPage++;
    this.loadHistory();
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadHistory();
    }
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
    if (confirm("¿TERMINAR SESIÓN Y CERRAR VÍNCULO?")) {
      // Avisa a la extensión antes de borrar todo
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        window.postMessage({
          source: 'SATUS_DASHBOARD',
          action: "SYNC_AUTH",
          token: "GUEST_TOKEN",
          user: { username: "INVITADO", role: "GUEST" }
        }, "*");
      }

      // Hacer el borrado local
      this.authService.logout();
      this.userRole = 'GUEST'; // Actualización visual inmediata
      this.userName = 'INVITADO';
      this.cd.detectChanges();

      // Redirigir al login 
      // this.router.navigate(['/login']);
    }
  }
}
